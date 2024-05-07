var counter = 0;
var timerX;
function RefreshSession() {
    counter++;
    clearTimeout(timerX);

    $.ajax({
        type: "POST",
        url: '/Home/KeepSessionAlive',
        data: {
            id: counter
        },
        success: function (data) {
            if (data == 'false') {
                window.location.href = '/Account/LogOff';
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            window.location.href = '/Account/LogOff';
        }
    });

    timerX = setInterval(RefreshSession, 10000);
}
RefreshSession();


if (localStorage.getItem("lastaccesstime") !== null) {
    var fromTime = new Date(localStorage.lastaccesstime);
    var toTime = new Date();

    var differenceTravel = toTime.getTime() - fromTime.getTime();
    var seconds = Math.floor((differenceTravel) / (1000));
    console.log('seconds: '+ seconds);
}
var counterExpireSesstion = 0;
var timerExpireSesstion;
function RefreshExpireSession() {
    counterExpireSesstion++;
    clearTimeout(timerExpireSesstion);
    if (localStorage.getItem("lastaccesstime") != null) {
        var fromTime = new Date(localStorage.lastaccesstime);
        var toTime = new Date();

        var differenceTravel = toTime.getTime() - fromTime.getTime();
        var seconds = Math.floor((differenceTravel) / (1000));
        console.log('seconds: '+ seconds);
        if (seconds > 1800)
        {
            localStorage.lastaccesstime = null;
            window.location.href = '/Account/LogOffAndResetPlan';
        }
    }

    localStorage.lastaccesstime = new Date();
    console.log(localStorage.lastaccesstime);

    timerExpireSesstion = setInterval(RefreshExpireSession, 5000);
}
if (is_auto_register == 'true')
{
    RefreshExpireSession();
}
var inlineManualTopicId = @ViewBag.inlineManualTopicId;

     