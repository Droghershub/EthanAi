using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http.Headers;
using System.Runtime.Serialization;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Configuration;
using System.Xml;
using System.Xml.Linq;
using System.Xml.Serialization;

namespace BTO.Models
{
    public class WebConfigBySingleton
    {
        public bool isCanEditProfile = false;
        private static WebConfigBySingleton instance;
        private WebConfigBySingleton()
        {
            if (WebConfigurationManager.AppSettings["CanEditProfile"] != null)
            {
                isCanEditProfile = bool.Parse(WebConfigurationManager.AppSettings["CanEditProfile"].ToString());
            }
        }

        public static WebConfigBySingleton Instance
        {
            get
            {
                if (instance == null)
                {
                    return new WebConfigBySingleton();
                }
                return instance;
            }
        }
    }
    public static class Ultils
    {       
        public class ImageUpload
        {
            public bool status { get; set; }
            public string photo_content { get; set; }
            public string messeger { get; set; }
        }
        public static ImageUpload DeleteFileFromFolder(string StrFilename)
        {
            ImageUpload imageUpload = new ImageUpload();
            try
            { 
                string strPhysicalFolder = HttpContext.Current.Server.MapPath("~/");// Server.MapPath("..\\");

                string strFileFullPath = strPhysicalFolder + StrFilename;

                if (System.IO.File.Exists(strFileFullPath))
                {
                    System.IO.File.Delete(strFileFullPath);
                }
                imageUpload.status = true;
            }
            catch (Exception e)
            {
                imageUpload.status = false;
                imageUpload.messeger = e.Message.ToString();
            }
            return imageUpload;
        }
        public static ImageUpload UploadImageToServer(string contentMapImage, string type)
        {
            ImageUpload imageUpload = new ImageUpload();
            if (!String.IsNullOrEmpty(contentMapImage))
            {
                if (string.IsNullOrEmpty(type))
                {
                    type = "images";
                }
                string subPath = "data/" + type;
                string root = HttpContext.Current.Server.MapPath("~/"); 
                try
                {
                    if (!System.IO.Directory.Exists(root + subPath))
                    {
                        System.IO.Directory.CreateDirectory(root + subPath);
                    }
                    Guid id = Guid.NewGuid();
                    var myString = contentMapImage.Split(new char[] { ',' });
                    byte[] bytes = Convert.FromBase64String(myString[1]);
                    using (System.IO.MemoryStream ms = new System.IO.MemoryStream(bytes))
                    {
                        System.Drawing.Image image = System.Drawing.Image.FromStream(ms);
                        String path = root + subPath + "/" + id.ToString() + ".jpg";
                        image.Save(path); 
                        imageUpload.status = true;
                        imageUpload.photo_content = "/" + subPath + "/" + id.ToString() + ".jpg";
                    }
                }
                catch (Exception e)
                {
                    imageUpload.status = false;
                    imageUpload.messeger = e.Message.ToString();
                }
            }
            return imageUpload;
        }
        public static string SerializeObject<T>(this T toSerialize)
        {
            XmlSerializer xmlSerializer = new XmlSerializer(toSerialize.GetType());

            using (StringWriter textWriter = new StringWriter())
            {
                xmlSerializer.Serialize(textWriter, toSerialize);
                return RemoveAllNamespaces(XElement.Parse(textWriter.ToString())).ToString();
            }
        }
        public static T XmlDeserializerFromString<T>(this String stringData)
        {
            return (T)DeserializeXmlToObject(stringData, typeof(T));
        }
        public static object DeserializeXmlToObject(this string data, Type type)
        {
            XmlDictionaryReader reader = XmlDictionaryReader.CreateTextReader(GenerateStreamFromString(data), new XmlDictionaryReaderQuotas());

            DataContractSerializer ser = new DataContractSerializer(type);

            return (object)ser.ReadObject(reader);

        }
        public static Stream GenerateStreamFromString(string s)
        {
            MemoryStream stream = new MemoryStream();
            StreamWriter writer = new StreamWriter(stream);
            writer.Write(s);
            writer.Flush();
            stream.Position = 0;
            return stream;
        }
        public static XElement RemoveAllNamespaces(XElement e)
        {
            return new XElement(e.Name.LocalName,
               (from n in e.Nodes()
                select ((n is XElement) ? RemoveAllNamespaces(n as XElement) : n)),
               (e.HasAttributes) ? (from a in e.Attributes()
                                    where (!a.IsNamespaceDeclaration)
                                    select new XAttribute(a.Name.LocalName, a.Value)) : null);
        }

        public static string ToXML(this object toSerialize)
        {
            Type t = toSerialize.GetType();

            Type[] extraTypes = t.GetProperties()
                .Where(p => p.PropertyType.IsInterface)
                .Select(p => p.GetValue(toSerialize, null).GetType())
                .ToArray();

            DataContractSerializer serializer = new DataContractSerializer(t,extraTypes);
            StringWriter sw = new StringWriter();
            XmlTextWriter xw = new XmlTextWriter(sw);
            serializer.WriteObject(xw, toSerialize);
            //return sw.ToString();
            return RemoveAllNamespaces(XElement.Parse(sw.ToString())).ToString();
        }
        public static string SerializerToXML(this object toSerialize)
        {
            Type t = toSerialize.GetType();

            Type[] extraTypes = t.GetProperties()
                .Where(p => p.PropertyType.IsInterface)
                .Select(p => p.GetValue(toSerialize, null).GetType())
                .ToArray();

            DataContractSerializer serializer = new DataContractSerializer(t, extraTypes);
            StringWriter sw = new StringWriter();
            XmlTextWriter xw = new XmlTextWriter(sw);
            serializer.WriteObject(xw, toSerialize);
            return sw.ToString();
        } 

        public static string GetValueByKeyFromConfig(string keyName)
        {
            return WebConfigurationManager.AppSettings[keyName].ToString();
        }
        public static string GetValueFromStringByRegexFormat(string input, int typeRegex)
        {
            String regex = String.Empty,result = String.Empty;
            if(typeRegex == 0)
            {
                regex = "username=([^;]+)";
                MatchCollection coll = Regex.Matches(input, regex);
                if (coll.Count > 0)
                    result = coll[0].Groups[1].Value;
            }else if(typeRegex == 1)
            {
                regex = "ASP.NET_SessionId=([^;]+)";
                MatchCollection coll = Regex.Matches(input, regex);
                if (coll.Count > 0)
                    result = coll[0].Groups[1].Value;
            }
            return result;
        }

         public static string GetBrowserVersion(HttpHeaderValueCollection<ProductInfoHeaderValue> userAgent)
        {
            string version = "";
           var name =  userAgent.ToString();

           if (name.Contains("Chrome"))
           {
               version = userAgent.Where(t=>t.Product != null).ToList().Where(t=>t.Product.Name.Equals("Chrome")).FirstOrDefault().Product.Version;
           }
           else if(name.Contains("Safari"))
           {
               version = userAgent.Where(
                   t=>t.Product != null 
                   ).ToList().Where(t=>t.Product.Name.Equals("Version")).SingleOrDefault().Product.Version;
           }
           else if (userAgent.ToString().Contains("MSIE") || userAgent.ToString().Contains("Trident/") || userAgent.ToString().Contains("Edge/"))
           {
               var ua = userAgent.ToString();
               if (ua.IndexOf("Edge/") > 0)
                   return "12";
               else if (ua.IndexOf("Trident/7.0") > 0)
                   return "11";
               else if (ua.IndexOf("Trident/6.0") > 0)
                   return "10"; 
               else if (ua.IndexOf("MSIE") > 0)
                   return "9";
           }
           else{
               version = userAgent.ElementAt(userAgent.Count - 1).Product.Version;
           } 
           return version== null ? "" : version;
        }

         internal static string GetBrowserName(HttpHeaderValueCollection<ProductInfoHeaderValue> httpHeaderValueCollection)
         {
             try
             {
                 var useragent = httpHeaderValueCollection.ToString();
                 if (useragent.Contains("Chrome"))
                     return "Chrome";
                 else if (useragent.Contains("Firefox"))
                     return "Firefox";
                 else if (useragent.Contains("Gecko") && (useragent.Contains("MSIE") || useragent.Contains("Trident/") || useragent.Contains("Edge/")))
                     return "InternetExplorer";
                 else if (useragent.Contains("Safari"))
                     return "Safari";
                 else
                     return httpHeaderValueCollection.ElementAt(httpHeaderValueCollection.Count - 1).Product.Name;
             }catch(Exception)
             {
                 return  "Unknown";
             }
         }
         public static IList<string> GetListTheme()
         {
             string path = System.Web.Hosting.HostingEnvironment.MapPath("~/Themes/");
             IList<string> themes = new List<string>();
             foreach (string s in Directory.GetDirectories(path))
             {
                 themes.Add(s.Remove(0, path.Length));
             }
             return themes;
         }
         internal static string GetUiVersion(IList<string> list)
         {
             IList<string> listAvailiableThemes = GetListTheme();
             bool isAvaliable = false;
             for (int i = 0; i < list.Count; i++)
             {
                 isAvaliable = false;
                 for (int j = 0; j < listAvailiableThemes.Count; j++)
                 {
                     if (list[i] != null && list[i].Equals(listAvailiableThemes[j]))
                     {
                         isAvaliable = true;
                         break;
                     }
                 }
                 if (isAvaliable == false)
                 {
                     list.RemoveAt(i);
                     i = i - 1;
                 }
             }

             if (list.Count == 0 || (list.Count == 1 && list[0] == null))
             {
                return  WebConfigurationManager.AppSettings["DefaultUiVersion"].ToString();
             }
             else
             {
                 return list.First();
             }
         }
    }
    //  Singleton for Get config
    sealed public class SystemTrackingLevelManagement
    {
        private static SystemTrackingLevelManagement instance;// = new SystemTrackingLevelManagement();
        public  bool enableTracking = false;
        public int levelTracking = 0;
        private SystemTrackingLevelManagement()
        {
            enableTracking = bool.Parse(Ultils.GetValueByKeyFromConfig(Contrainst.EnableTracking));
            levelTracking = int.Parse(Ultils.GetValueByKeyFromConfig(Contrainst.TrackingLevel));
        }
        public bool IsEnableTracking { 
            get { 
            return this.enableTracking;
            }
        }
        public int LevelTracking
        {
            get
            {
                return this.levelTracking;
            } 
        }
        public static SystemTrackingLevelManagement Instance
        {
            get
            {
                if(instance ==  null)
                {
                    instance = new SystemTrackingLevelManagement(); 
                } 
                return instance;
            }
        } 
       
    }
}