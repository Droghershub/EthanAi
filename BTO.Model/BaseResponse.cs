using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Model
{
    public class BaseResponse<T>
    {
        /// <summary>
        /// Error code
        /// </summary>
        public string errcode { get; set; }
        /// <summary>
        /// Error message
        /// </summary>
        public string errmessage { get; set; }
        /// <summary>
        /// Result
        /// </summary>
        public T results { get; set; }
        /// <summary>
        /// Success
        /// </summary>
        public bool success { get; set; }
    }
}
