using BTO.Model.Portfolio;
using BTO.Model.Tracking;
using BTO.Modules;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using BTO.Service.Portfolios;
using System.Collections;
namespace BTO.API
{
    [RoutePrefix("api/portfolio")]
    public class ImportFileController : BTOAPIController
    {
        public IPortfolioService _portfolioService { get; set; }
        public IPortfolioSheetService _portfolioSheetService { get; set; }

        [Route("get")]
        [HttpGet]
        // GET api/<controller>
        public object Get()
        {
            ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
            Guid user_id = Guid.Empty;
            if (client != null)
            {
                user_id = client.user_id;
                var portfolios = GetPortfolioByUserId(user_id);
                return portfolios;
            }
            return Request.CreateResponse(HttpStatusCode.BadRequest, "Session is expired!");
        }
        [Route("delete/{id}")]
        [HttpPost]
        // GET api/<controller>
        public object Delete(int id)
        {
            ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
            Guid user_id = Guid.Empty;
            if (client != null)
            {
                user_id = client.user_id;
                int rowImpact = _portfolioSheetService.DeleteById(user_id, id);
                return Request.CreateResponse(HttpStatusCode.OK, rowImpact);
            }
            return Request.CreateResponse(HttpStatusCode.BadRequest, "Session is expired!");
        }

        private IList<PortfolioSheet> GetPortfolioByUserId(Guid user_id)
        {
            var portfolios = _portfolioSheetService.GetByUserId(user_id);
            return portfolios;
        }
        [Route("get-by-portfolio-sheet-id/{id}")]
        [HttpGet]
        // GET api/<controller>
        public object GetByPortfolioId(int id)
        {
            var portfolios = _portfolioService.GetBySheetId(id);
            return portfolios;
        }

        [Route("get-all-portfolios")]
        [HttpGet]
        // GET api/<controller>
        public object GetAllPorfolioByUserId()
        {
            ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
            Guid user_id = Guid.Empty;
            if (client != null)
                user_id = client.user_id;
            var portfolios = _portfolioService.GetByUserId(user_id);
            return portfolios;
        }
        [Route("import")]
        [HttpPost]
        // GET api/<controller>
        public async Task<HttpResponseMessage> PostFormData()
        {
            // Check if the request contains multipart/form-data.
            if (!Request.Content.IsMimeMultipartContent())
            {
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
            }

            string root = HttpContext.Current.Server.MapPath("~/App_Data/excel_files");
            var provider = new MultipartFormDataStreamProvider(root);

            try
            {
                // Read the form data.
                await Request.Content.ReadAsMultipartAsync(provider);

                ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
                Guid user_id = Guid.Empty;
                if (client != null)
                    user_id = client.user_id;
                // This illustrates how to get the file names.
                foreach (MultipartFileData file in provider.FileData)
                {
                    IList<string> results = ImportExcelFile(file.LocalFileName, user_id);
                    if (results.Count == 0)
                    {
                        return Request.CreateResponse(HttpStatusCode.OK, this.GetPortfolioByUserId(user_id));
                        // results.Add("Import successfull");
                    }
                    return Request.CreateResponse(HttpStatusCode.InternalServerError, results);
                }
                return Request.CreateResponse(HttpStatusCode.BadRequest, "Dont' have any file data!");
            }
            catch (System.Exception e)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError,e.StackTrace);
            }
        }
        public IList<string> ImportExcelFile(string localPath, Guid user_id)
        {
            IList<string> errors = new List<string>();
            //Create COM Objects. Create a COM object for everything that is referenced
            byte[] file = File.ReadAllBytes(@"" + localPath);
            MemoryStream ms = new MemoryStream(file);

            IDictionary<string, DataTable> sheets = new Dictionary<string, DataTable>();
            using (ExcelPackage package = new ExcelPackage(ms))
            {
                if (package.Workbook.Worksheets.Count == 0)
                    errors.Add("Your Excel file does not contain any work sheets");
                else
                {

                    foreach (ExcelWorksheet worksheet in package.Workbook.Worksheets)
                    {

                        ExcelCellAddress startCell = worksheet.Dimension.Start;
                        ExcelCellAddress endCell = worksheet.Dimension.End;
                        var dt = new DataTable();
                        //Create the data column 
                        // icount
                        IDictionary<int, int> mergeColumns = new Dictionary<int, int>();
                        IDictionary<int, string> mergeColumnValues = new Dictionary<int, string>();
                        for (int col = startCell.Column; col <= endCell.Column; col++)
                        {
                            dt.Columns.Add(col.ToString());
                        }
                        for (int row = startCell.Row; row <= endCell.Row; row++)
                        {
                            DataRow dr = dt.NewRow(); //Create a row
                            int i = 0;

                            for (int col = startCell.Column; col <= endCell.Column; col++)
                            {
                                try
                                {
                                    if (worksheet.Cells[row, col].Value != null)
                                    {
                                        bool isMerge = worksheet.Cells[row, col].Merge;
                                        if (isMerge)
                                        {
                                            mergeColumns.Remove(col);
                                            mergeColumnValues.Remove(col);
                                            int j = row;
                                            for (; j < endCell.Row; j++)
                                            {
                                                if (!worksheet.Cells[j, col].Merge) break;
                                            }
                                            j = j - row - 1;
                                            mergeColumns.Add(col, j);
                                            mergeColumnValues.Add(col, worksheet.Cells[row, col].Value.ToString());
                                        }
                                        dr[i++] = worksheet.Cells[row, col].Value.ToString();
                                    }
                                    else
                                    {
                                        int valueOut;
                                        if (mergeColumns.TryGetValue(col, out valueOut) && valueOut > 0)
                                        {
                                            string value = mergeColumnValues[col];
                                            dr[i++] = mergeColumnValues[col];
                                            mergeColumns[col] = mergeColumns[col] - 1;
                                        }
                                    }
                                }
                                catch (System.Exception e)
                                {
                                    errors.Add("Error while try parse file at row:" + row.ToString() + " Error Name:" + e.Message);
                                    // return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, e);
                                }
                            }
                            dt.Rows.Add(dr);
                        }

                        sheets.Add(worksheet.Name, dt);
                    }
                }
            }
            try
            {
                // Process sheet table

                foreach (KeyValuePair<string, DataTable> sheet in sheets)
                {
                    string sheetName = sheet.Key;
                    PortfolioSheet portfolioSheet = new PortfolioSheet()
                    {
                        name = sheetName,
                        user_id = user_id
                    };
                    _portfolioSheetService.Create(portfolioSheet);

                    DataTable dt = sheet.Value;

                    // foreach (DataRow dr in dt.Rows)
                    for (int i = 1; i < dt.Rows.Count; i++)
                    {
                        DataRow dr = dt.Rows[i];
                        Portfolio port = null;
                        try
                        {
                            port = new Portfolio()
                            {
                                portfolio_sheet_id = portfolioSheet.id,
                                stock = dr[0].ToString(),
                                symbol = dr[1].ToString(),
                                isin = dr[2].ToString(),
                                cusip = dr[3].ToString(),
                                exch = dr[4].ToString(),
                                exch_detail = dr[5].ToString(),
                                ccy = dr[6].ToString(),
                                price = decimal.Parse(dr[7].ToString().Trim()),
                                quantity = decimal.Parse(dr[8].ToString().Trim()),
                                position = decimal.Parse(dr[9].ToString().Trim()),
                                date_time = dr[10].ToString(),
                                asset_class = dr[11].ToString(),
                                oportfolio_stategy = dr[12].ToString(),
                            };

                        }
                        catch (Exception ex)
                        {

                            // errors.Add("Error while saving to database :" + ex.Message);
                        }
                        if (port != null)
                            _portfolioService.Create(port);
                    }
                }
            }
            catch (Exception ex)
            {

                errors.Add("Error while saving to database :" + ex.Message);
            }
            return errors;
        }
    }

}
