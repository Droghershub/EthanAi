using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel;
using System.Reflection;
using System.Runtime.Serialization;
using System.IO;
using System.Xml;
using System.Xml.Linq;
using System.Xml.Serialization;
namespace BTO.Common
{
    public static class Utils
    {
        public static T DeserializeFromXmlString<T>(string xmlString)
        {
            var serializer = new XmlSerializer(typeof(T));
            using (TextReader reader = new StringReader(xmlString))
            {
                return (T)serializer.Deserialize(reader);
            }
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
        public static string ToXML(this object toSerialize)
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
            //return sw.ToString();
            return RemoveAllNamespaces(XElement.Parse(sw.ToString())).ToString();
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
        public static double[] SumArrays(double[] array1, double[] array2)
        {
            double[] result = new double[array1.Length];
            int lenght = array1.Length;
            for (int i = 0; i < lenght; ++i)
                result[i] = array1[i] + array2[i];
            return result;
        }

        public static double[] SubtractionArrays(double[] array1, double[] array2)
        {
            double[] result = new double[array1.Length];
            int lenght = array1.Length;
            for (int i = 0; i < lenght; ++i)
                result[i] = array1[i] - array2[i];
            return result;
        }

        public static double[] MinArrays(double[] array1, double[] array2)
        {
            double[] result = new double[array1.Length];
            int lenght = array1.Length;
            for (int i = 0; i < lenght; ++i)
            {
                result[i] = array1[i] > array2[i] ? array2[i] : array1[i];
            }
                
            return result;
        }

        public static double[] PositiveArrays(double[] array)
        {
            double[] result = new double[array.Length];
            for (int i = 0; i < array.Length; ++i)
            {
                result[i] = Math.Max(array[i],0);
            }
            return result;
        }

        public static double[] EquityArrays(double[] array)
        {
            double[] result = new double[array.Length];
            double negative = 0;
            for (int i = 0; i < array.Length; ++i)
            {
                if (negative == 0 && array[i] < 0)
                    negative = array[i];
                result[i] = array[i] < 0 ? negative : array[i];
            }
            return result;
        }
        public static string getActionDescription(BTO.Common.WebAction.Action action)
        {
            Type type = action.GetType();
            
            MemberInfo[] memInfo = type.GetMember(action.ToString());

            if (memInfo != null && memInfo.Length > 0)
            {
                object[] attrs = memInfo[0].GetCustomAttributes(typeof(DescriptionAttribute), false);

                if (attrs != null && attrs.Length > 0)
                {
                    return ((DescriptionAttribute)attrs[0]).Description;
                }
            }

            return action.ToString();
        }
        public static bool CheckPermissionOnAction(List<BTO.Model.UserManagement.FunctionAccessModel> listPermission,BTO.Model.Common.FunctionPermission action)
        {
            List<BTO.Model.UserManagement.FunctionAccessModel> obj = listPermission.Where(i => i.name == Enum.GetName(typeof(BTO.Model.Common.FunctionPermission), action)).ToList();
            if (obj != null && obj.Count > 0)
            {
                BTO.Model.UserManagement.FunctionAccessModel model = obj.FirstOrDefault();
                if (model.action == Model.Common.FunctionAction.READ_WRITE)
                    return true;
                return false;
            }
            return false;
        }
    }
}
