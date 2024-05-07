using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web;
using BTO.Model;
using BTO.Model.Tracking;
using BTO.Service; 
using Moq;
using Autofac.Integration.WebApi;
using Newtonsoft.Json.Linq;
using BTO.Modules;
using BTO.Service.Profile;
using System.Web.Script.Serialization;
using Newtonsoft.Json;
using BTO.Model.Common;
using BTO.Model.UserManagement;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using System.IO;
using System.Text;
using BTO.Models;
using BTO.Model.Profile;

namespace BTO.API
{
    [RoutePrefix("api/images")]
    public class ImageManagementController : BTOAPIController
    {
        public IImageManagementService _imageManagementService { get; set; }
        public IUserProfileService _userProfileService { get; set; }
        [Route("GET/{user_id:guid}")] 
        [HttpGet]
        public IList<Image> Get(Guid user_id)
        {
            return _imageManagementService.Get(user_id);
        }
        [Route("GetImages")]
        [HttpPost]
        // GET api/<controller>
        public object GetImages(Object input)
        {
            JObject jsonObj = (JObject)input;
            Guid user_id = Guid.Parse((string)jsonObj.GetValue("user_id"));
            ImageType type = (ImageType)Enum.Parse(typeof(ImageType), (string)jsonObj.GetValue("type"));
            int dream_type_id = (int)jsonObj.GetValue("dream_type_id");
            return _imageManagementService.Get(user_id, type, dream_type_id);            
        }
        [HttpPost]
        [Route("ADD")]
        public Image Add(Image image)
        { 
            BTO.Models.Ultils.ImageUpload item =  BTO.Models.Ultils.UploadImageToServer(image.url,BTO.Models.Contrainst.AvatarFolder);
            if (item.status)
            {
                // save photo
                image.url = item.photo_content;
                Image itemAdd = _imageManagementService.Add(image);
                // change avatar for profile
                UserProfile userProfile = _userProfileService.GetByUserId(image.user_id);
                if (userProfile != null)
                {
                    if (image.type == ImageType.CHILDREN_AVATAR)
                    {
                        if (image.dream_type_id != null && image.dream_type_id >= 0)
                            userProfile.dependent.ElementAt(image.dream_type_id??0).avatar = item.photo_content;
                    }
                    else
                    {
                        if (image.type == ImageType.CLIENT_AVATAR)
                        {
                            userProfile.avatar = item.photo_content;
                        }
                        else if (image.type == ImageType.SPOUSE_AVATAR)
                        {
                            userProfile.spouse_avatar = item.photo_content;
                        }
                    }
                    _userProfileService.UpdateProfile(userProfile, userProfile);
                }
            }
            return image;
        }

        [HttpPost]
        [Route("Delete")]
        public int Delete(Image image)
        {
            Image item = _imageManagementService.GetById(image.id);
            if (item != null)
            {
                int iCount = _imageManagementService.Delete(image.id);
                if (iCount > 0)
                {
                    BTO.Models.Ultils.DeleteFileFromFolder(item.url);
                }
            }
            return 0;
        }
        [HttpPost]
        [Route("Update")]
        public int Update(Image image)
        {
            Image item = _imageManagementService.GetById(image.id);
            if (item != null)
            {
                UserProfile userProfile = _userProfileService.GetByUserId(image.user_id);
                if (userProfile != null)
                {
                     if (image.type == ImageType.CHILDREN_AVATAR)
                    {
                        if (image.dream_type_id != null && image.dream_type_id >= 0)
                        {
                            if (image.dream_type_id < userProfile.dependent.Count)
                            {
                                userProfile.dependent.ElementAt(image.dream_type_id ?? 0).avatar = item.url;
                            }
                            //else
                            //{
                            //    userProfile.dependent.Add(new UserProfileDependent()
                            //    {
                                    
                            //    });
                            //}
                        }
                    }else if (image.type == ImageType.CLIENT_AVATAR)
                    {
                        userProfile.avatar = item.url;
                    }
                    else if (image.type == ImageType.SPOUSE_AVATAR)
                    {
                        userProfile.spouse_avatar = image.url;
                    }
                    _userProfileService.UpdateProfile(userProfile, userProfile);
                    return 1;
                } 
            }
            return 0;
        }


    }
}