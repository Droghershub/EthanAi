using System.Web;
using System.Web.Optimization;

namespace BTO
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.validate*"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                      "~/Scripts/bootstrap.js",
                      "~/Scripts/respond.js"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/bootstrap.min.css",
                      "~/Content/bootstrap-social.min.css",
                      "~/Content/font-awesome.min.css.css",
                      "~/Content/newSite.css"
                      ));

            bundles.Add(new StyleBundle("~/Content/customCSS").Include(
                "~/Content/custom-control.css"
                ));

            // BUNDLE RESOUCE
            bundles.Add(new ScriptBundle("~/New/bundles/jquery").Include(
                        "~/Scripts/jquery-2.2.4.min.js"));

            bundles.Add(new ScriptBundle("~/New/bundles/bootstrap").Include(
                      "~/Scripts/bootstrap.min.js"));

            bundles.Add(new ScriptBundle("~/New/bundles/angularjs").Include(
                       "~/Scripts/angular.min.js",
                       "~/Scripts/angular-animate.min.js",
                       "~/Scripts/angular-cookies.min.js",
                       "~/Scripts/angular-touch.js"));

            bundles.Add(new ScriptBundle("~/New/bundles/bto").Include(
                       "~/Scripts/newBto/bto*",
                       "~/Scripts/newBto/controller/bto*",
                       "~/Scripts/newBto/directive/directive*",
                       "~/Scripts/newBto/service/service*"));

            bundles.Add(new ScriptBundle("~/New/bundles/thirdparty").Include(
                       "~/Scripts/thirdparty/ng-currency.js",
                       "~/Scripts/thirdparty/ngWebSocket.js",
                       "~/Scripts/thirdparty/angular-material/gesture.js",
                       //"~/Scripts/thirdparty/i18n/angular-locale_es-ar.js",
                       //"~/Scripts/thirdparty/ngStorage.min.js",
                       //"~/Scripts/thirdparty/angular-ui-router.min.js",
                       //"~/Scripts/thirdparty/angular-messages.js",
                       "~/Scripts/thirdparty/angular-translate.js",
                       "~/Scripts/thirdparty/angular-translate-loader-static-files.js",
                       "~/Scripts/thirdparty/treasure-overlay-spinner.js",
                       "~/Scripts/thirdparty/angular-rangeslider/angular.rangeSlider.js",
                       //"~/Scripts/thirdparty/ng-sortable.js",
                       "~/Scripts/thirdparty/smart-table.js",
                       "~/Scripts/thirdparty/notification/bootstrap-notify.js",
                       "~/Scripts/thirdparty/angular-carousel/angular-carousel.js",
                       "~/Scripts/thirdparty/ng-img-crop.js"
                       ));

            bundles.Add(new StyleBundle("~/New/Content/css").Include(
                      "~/Content/bootstrap.css",
                      "~/Scripts/thirdparty/angular-rangeslider/angular.rangeSlider.css",
                      "~/Content/treasure-overlay-spinner.css",
                      "~/Content/newSite.css"));

            bundles.Add(new StyleBundle("~/New/themes").Include(
                     "~/Scripts/thirdparty/angular-carousel/angular-carousel.css"
                     ));
 
            //bundles.Add(new ScriptBundle("~/BTO/js").Include(
            //    "~/Scripts/newBto/btoApp.js",
            //    "~/Scripts/newBto/btoConfig.js",
            //    "~/Scripts/newBto/controller/btoMainController.js",
            //    "~/Scripts/newBto/controller/btoScenarioController.js",
            //    "~/Scripts/newBto/controller/btoSolutionController.js",
            //    "~/Scripts/newBto/directive/directiveCommon.js",
            //    "~/Scripts/newBto/directive/directiveGaugeChart.js",
            //    "~/Scripts/newBto/directive/directiveProgressBar.js",
            //    "~/Scripts/newBto/directive/directiveTable.js",



            //           "~/Scripts/newBto/service/serviceManual.js",
            //           "~/Scripts/newBto/service/serviceAccount.js",
            //           "~/Scripts/newBto/service/serviceAction.js",
            //           "~/Scripts/newBto/service/serviceChart.js",
            //           "~/Scripts/newBto/service/servicePersonalPlan.js",
            //           "~/Scripts/newBto/service/servicePlayback.js",
            //           "~/Scripts/newBto/service/serviceProfile.js",
            //           "~/Scripts/newBto/service/serviceRating.js",
            //           "~/Scripts/newBto/service/serviceInvitation.js",
            //           "~/Scripts/newBto/service/serviceUser.js",
            //           "~/Scripts/newBto/service/serviceUtil.js",
            //           "~/Scripts/newBto/service/serviceStarting.js",


            //           "~/Themes/4/Scripts/services/illiquidAssetService.js",
            //           "~/Themes/4/Scripts/services/investmentService.js",
            //           "~/Themes/4/Scripts/services/retirementLifeStyleService.js",
            //           "~/Themes/4/Scripts/services/savingRateService.js",
            //           "~/Themes/4/Scripts/services/newsService.js",
            //           "~/Themes/4/Scripts/services/parameterService.js",
            //           "~/Themes/4/Scripts/ng-img-crop.js",
            //           "~/Themes/4/Scripts/timelineService.js",
            //           "~/Themes/4/Scripts/smallTimelineService.js",
            //           "~/Themes/4/Scripts/quickSettingService.js",
            //           "~/Themes/4/Scripts/quickHelpService.js",
            //           "~/Themes/4/Scripts/timelineFunctions.js",
            //           "~/Themes/4/Scripts/timeline.js",
            //           "~/Themes/4/Scripts/directive.js",
            //           "~/Themes/4/Scripts/bto.js",
            //           "~/Themes/4/Scripts/script.js",
            //           "~/Themes/4/Scripts/touch.js",
            //           "~/Themes/4/Scripts/jquery.number.js",
            //           "~/Themes/4/Scripts/swiper.js"
            //           ));

            bundles.Add(new ScriptBundle("~/themes/4/amchartjs").Include(
                "~/Themes/4/Scripts/amcharts/amcharts.js",
                "~/Themes/4/Scripts/amcharts/serial.js",
                "~/Themes/4/Scripts/amcharts/pie.js",
                "~/Themes/4/Scripts/amcharts/themes/light.js",
                "~/Themes/4/Scripts/amcharts/plugins/animate/animate.min.js",
                "~/Themes/4/Scripts/amcharts/plugins/export/export.js"
                ));

            bundles.Add(new ScriptBundle("~/themes/4/javascript").Include(
                "~/Themes/4/Scripts/jquery.number.js",
                "~/Themes/4/Scripts/touch.js",
                "~/Themes/4/Scripts/timeline.js",
                "~/Themes/4/Scripts/ng-img-crop.js",
                "~/Themes/4/Scripts/bto.js"
                ));

            bundles.Add(new StyleBundle("~/themes/4/styles").Include(
                //"~/Themes/4/Content/bto.css",
                //"~/themes/4/content/custom.css",
                //"~/Themes/4/Content/timeline.css",
                //"~/Themes/4/Content/drop-drap-control.css",
                "~/Themes/4/Content/style.css",
                "~/Themes/4/Content/theme-customize.css",
                "~/Themes/4/Content/swiper.min.css",
                "~/Themes/4/Content/ie.css",
                "~/Themes/4/Content/ng-img-crop.css",
                "~/Themes/4/Scripts/amcharts/plugins/export/export.css"
                ));
            // END BUNDLE RESOUCE
        }
    }
}
