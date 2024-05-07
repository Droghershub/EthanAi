using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using BTO.Model;
using System;
namespace BTO.Models
{
    public class ExternalLoginConfirmationViewModel
    {
        [Display(Name = "ProviderKey")]
        public string providerKey { get; set; }

        public bool isAccountExisted { get; set; }

        [Display(Name = "LoginProvider")]
        public string loginProvider { get; set; }


        [Required]
        [Display(Name = "Email")]
        public string Email { get; set; }

        [Display(Name = "year of Birth")]
        public DateTime yearOfBirth { get; set; }
        public bool isSelectedYearOfBirth { get; set; }

        [Display(Name = "Gender")]
        public int gender { get; set; }
        public bool isSelectedGender { get; set; }

        [Display(Name = "Location")]
        public string location { get; set; }
        public bool isSelectedLocation  {get; set;}

        [Display(Name = "Marital status")]
        public bool maritalStatus { get; set; }
        public bool isSelectedMaritalStatus { get; set; }

        [Display(Name = "First name")]
        public string firstName { get; set; }
        public bool isSelectedFirstName  {get; set;}

        [Display(Name = "Last name")]
        public string lastName { get; set; }
        public bool isSelectedLastName {get; set;}

        [Display(Name = "Avatar")]
        public string avatar { get; set; }
        public bool isSelectedAvatar { get; set; }

    }
    public class BasicResult
    {
        public PersonaPlan currentplan { get; set; }
        public PersonaPlan newplan { get; set; }
        public MainResult result { get; set; }
    }
    public class ExternalLoginListViewModel
    {
        public string ReturnUrl { get; set; }
    }

    public class SendCodeViewModel
    {
        public string SelectedProvider { get; set; }
        public ICollection<System.Web.Mvc.SelectListItem> Providers { get; set; }
        public string ReturnUrl { get; set; }
        public bool RememberMe { get; set; }
    }

    public class VerifyCodeViewModel
    {
        [Required]
        public string Provider { get; set; }

        [Required]
        [Display(Name = "Code")]
        public string Code { get; set; }
        public string ReturnUrl { get; set; }

        [Display(Name = "Remember this browser?")]
        public bool RememberBrowser { get; set; }

        public bool RememberMe { get; set; }
    }

    public class ForgotViewModel
    {
        [Required]
        [Display(Name = "Email")]
        public string Email { get; set; }
    }

    public class LoginViewModel
    {
        [Required(ErrorMessageResourceType = typeof(Resources.Resource),
                  ErrorMessageResourceName = "EmailIsRequired")]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }

        [Display(Name = "Remember me?")]
        public bool RememberMe { get; set; }
    }

    public class AuthenticationViewModel
    {        
        public string Username { get; set; }
        public string Password { get; set; }
        public string Type { get; set; }
    }

    public class RegisterViewModel
    {
        [Required]
        [EmailAddress]
        [Display(Name = "Email")]
        public string Email { get; set; }

        [Required]
        [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "Confirm password")]
        [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
        public string ConfirmPassword { get; set; }
    }

    public class ResetPasswordViewModel
    {
        [Required]
        [EmailAddress]
        [Display(Name = "Email")]
        public string Email { get; set; }

        [Required]
        [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "Confirm password")]
        [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
        public string ConfirmPassword { get; set; }

        public string Code { get; set; }
    }

    public class ForgotPasswordViewModel
    {
        [Required]
        [EmailAddress]
        [Display(Name = "Email")]
        public string Email { get; set; }

        public string Error { get; set; }
    }
}
