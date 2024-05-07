btoApp.service('manageAvatarService', function ($rootScope, utilService, $timeout, CONFIG) {
    var selectedItem = null;
    $rootScope.myImage = '';
    $rootScope.myCroppedImage = '';
    $rootScope.MyImageModel = null;
    $rootScope.Avatar = {
        type: 0,
        dream_type_id: -1,
        src: 'Themes/' + version_id + '/Content/Images/avatar.png',
        canSave: 'false'
    }
    this.showDialogUpdateProfilePicture = function (type, dream_type_id) {
        $rootScope.Avatar.type = type;
        if ($rootScope.Avatar.type === 0) {
            if ($rootScope.profile.client.avatar != null && rootScope.profile.client.avatar != '') {
                $rootScope.Avatar.src = $rootScope.profile.client.avatar;
            } else {
                $rootScope.Avatar.src = 'Themes/' + version_id + '/Content/Images/avatar.png'
                $rootScope.Avatar.canSave = 'false';
            }
            $rootScope.Avatar.dream_type_id = -1;
        } else if ($rootScope.Avatar.type === 1) {
            if ($rootScope.profile.client.spouse_avatar != null && rootScope.profile.client.spouse_avatar != '') {
                $rootScope.Avatar.src = $rootScope.profile.client.spouse_avatar;
            } else {
                $rootScope.Avatar.src = 'Themes/' + version_id + '/Content/Images/avatar.png'
                $rootScope.Avatar.canSave = 'false';
            }
            $rootScope.Avatar.dream_type_id = -1;
        } else if ($rootScope.Avatar.type === 2) {
            $rootScope.Avatar.dream_type_id = dream_type_id;
            if ($rootScope.timelineService.selectedDream.photo_path == null || $rootScope.timelineService.selectedDream.photo_path == '') {
                if ($rootScope.Avatar.dream_type_id === 1)
                    $rootScope.Avatar.src = "/Themes/" + version_id + "/Content/Images/default-residence.jpg";
                else if ($rootScope.Avatar.dream_type_id === 2)
                    $rootScope.Avatar.src = "/Themes/" + version_id + "/Content/Images/default-education.jpg";
                else if ($rootScope.Avatar.dream_type_id === 3)
                    $rootScope.Avatar.src = "/Themes/" + version_id + "/Content/Images/default-expenses.jpg";
                $rootScope.Avatar.canSave = 'false';
            }
            else
                $rootScope.Avatar.src = $rootScope.timelineService.selectedDream.photo_path;
        }
        else if ($rootScope.Avatar.type === 3) {
            $rootScope.Avatar.dream_type_id = dream_type_id;
            if ($rootScope.timelineService.selectedLifeEvent.photo_path == null || $rootScope.timelineService.selectedLifeEvent.photo_path == '') {
                if ($rootScope.Avatar.dream_type_id === 4)
                    $rootScope.Avatar.src = "/Themes/" + version_id + "/Content/Images/default-residence.jpg";
                else if ($rootScope.Avatar.dream_type_id === 5)
                    $rootScope.Avatar.src = "/Themes/" + version_id + "/Content/Images/default-independent.jpg";
                else if ($rootScope.Avatar.dream_type_id === 6)
                    $rootScope.Avatar.src = "/Themes/" + version_id + "/Content/Images/default-income.jpg";
                $rootScope.Avatar.canSave = 'false';
            }
            else
                $rootScope.Avatar.src = $rootScope.timelineService.selectedLifeEvent.photo_path;
        } else if ($rootScope.Avatar.type == 4) {
            var index = dream_type_id;
            if ($rootScope.profileDialogData.children.childrens[index].avatar != null && $rootScope.profileDialogData.children.childrens[index].avatar != '') {
                $rootScope.Avatar.src = $rootScope.profileDialogData.children.childrens[index].avatar;
            } else {
                $rootScope.Avatar.src = 'Themes/' + version_id + '/Content/Images/avatar.png'
                $rootScope.Avatar.canSave = 'false';
            }
            $rootScope.Avatar.dream_type_id = index;
        }
        $rootScope.utilService.scopeApply();
        this.GetAllImages();
        $timeout(function () {
            $('#updateProfilePictures').modal({ backdrop: 'static', keyboard: false });
        }, 500);
    },
    this.edit = function () {
        if (selectedItem != null) {
            var self = this;
            selectedItem.type = $rootScope.Avatar.type;
            selectedItem.dream_type_id = $rootScope.Avatar.dream_type_id;
            utilService.callApiByAjax('POST', '/api/images/Update/', selectedItem, function (pl) {
                utilService.showSuccessMessage('Saved!');
                self.setUrlToImage(selectedItem.url);
                self.GetAllImages();
            });
        }
    }
    this.setUrlToImage = function (url) {
        if (angular.isDefined(url) && $rootScope.Avatar.type != null) {
            if ($rootScope.Avatar.type == 0) {
                $rootScope.profile.client.avatar = url;
                //document.getElementById('imgAvatar').src = url;
            }
            else if ($rootScope.Avatar.type === 1) {
                $rootScope.profile.client.spouse_avatar = url;
                //document.getElementById('imgSpouseAvatar').src = url;
            } else if ($rootScope.Avatar.type === 2) {
                $rootScope.timelineService.selectedDream.photo_path = url;
            }
            else if ($rootScope.Avatar.type === 3) {
                $rootScope.timelineService.selectedLifeEvent.photo_path = url;
            } else if ($rootScope.Avatar.type == 4) {
                if ($rootScope.Avatar.dream_type_id >= 0) {
                    // $rootScope.profileDialogData.children.childrens[$rootScope.Avatar.dream_type_id].avatar = url;
                    $rootScope.profileDialogData.children.childrens[$rootScope.Avatar.dream_type_id].avatar = url;
                }
            }
            utilService.scopeApply();
        }
        $('#updateProfilePictures').modal('hide');
    }
    this.delete = function (id) {
        var self = this;
        $timeout(function () {
            utilService.ShowDialog($rootScope, utilService.translate('Confirmation'), utilService.translate('Do you want to delete it?'), utilService.translate('Yes'),
               function () {
                   var obj = {
                       id: id,
                       user_id: user_id
                   };
                   utilService.callApiByAjax('POST', '/api/images/Delete/', obj, function (pl) {
                       utilService.showSuccessMessage('Successfully deleted!');
                       self.GetAllImages();
                   });
               }
                , utilService.translate('No'));
        }, 400);

    }
    this.saveChangeUpdatePicture = function () {
        if ($rootScope.Avatar.canSave === 'true') {
            var obj = {
                user_id: user_id,
                url: $rootScope.Avatar.src,
                type: $rootScope.Avatar.type,
                dream_type_id: $rootScope.Avatar.dream_type_id
            };
            var self = this;
            utilService.callApiByAjax('POST', '/api/images/ADD/', obj, function (pl) {
                $rootScope.Avatar.canSave = 'false';
                self.setUrlToImage(pl.url);
                utilService.showSuccessMessage('Saved!');
                self.GetAllImages();
            });
        } else if ($rootScope.Avatar.canSave === 'select') {
            this.edit();
            $rootScope.Avatar.canSave = 'false';
        }
        else {
            utilService.showWarningMessage("You can't save because you don't have any change.");
        }
    }
    this.GetAllImages = function () {
        $rootScope.imageCollections = [];
        var data = { user_id: user_id, type: $rootScope.Avatar.type, dream_type_id: $rootScope.Avatar.dream_type_id }
        utilService.callApi('POST', '/api/images/GetImages/', '', data, function (response) {
            $rootScope.imageCollections = angular.copy(response);
        });
    }
    this.select = function (id) {
        angular.forEach($rootScope.imageCollections, function (item) {
            if (item.id == id) {
                selectedItem = item;
            }
        });
        if (selectedItem != null) {
            $rootScope.Avatar.src = selectedItem.url;
            $rootScope.Avatar.canSave = 'select';
            $rootScope.utilService.scopeApply();
        }
    }
    this.encodeImage = function (file) {
        if (file) {
            this.resizeAndUpload(file);
            $rootScope.Avatar.canSave = 'true';
            $rootScope.utilService.scopeApply();
        }
    }
    this.resizeAndUpload = function (file) {
        var reader = new FileReader();
        reader.onloadend = function () {
            var tempImg = new Image();
            tempImg.src = reader.result;
            tempImg.onload = function () {
                var MAX_WIDTH = 300;
                var MAX_HEIGHT = 300;
                var tempW = tempImg.width;
                var tempH = tempImg.height;
                if (tempW > tempH) {
                    if (tempW > MAX_WIDTH) {
                        tempH *= MAX_WIDTH / tempW;
                        tempW = MAX_WIDTH;
                    }
                } else {
                    if (tempH > MAX_HEIGHT) {
                        tempW *= MAX_HEIGHT / tempH;
                        tempH = MAX_HEIGHT;
                    }
                }
                var canvas = document.createElement('canvas');
                canvas.width = tempW;
                canvas.height = tempH;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(this, 0, 0, tempW, tempH);
                var dataURL = canvas.toDataURL("image/jpeg");
                $rootScope.Avatar.src = dataURL;


            }
        }
        reader.readAsDataURL(file);
    }
    this.editThumbnail = function () {
        $rootScope.cropAvatar = { myCroppedImageW: 0, ratio: 1 }
        $rootScope.myCroppedImage = '';
        $rootScope.myImage = $rootScope.Avatar.src;
        var height = $('#imgAvatarPicture').height();
        var width = $('#imgAvatarPicture').width();
        //   utilService.scopeApply();
        var MAX_WIDTH = 300;
        var MAX_HEIGHT = 300;
        var ratio = 1;
        if (MAX_WIDTH / width > ratio) {
            ratio = MAX_WIDTH / width;
            height *= ratio;
            width *= ratio;
        }
        $rootScope.cropAvatar.ratio = ratio;
        var tempW = width;
        var tempH = height;
        if (tempW > tempH) {
            if (tempW > MAX_WIDTH) {
                tempH *= MAX_WIDTH / tempW;
                tempW = MAX_WIDTH;
            }
        } else {
            if (tempH > MAX_HEIGHT) {
                tempW *= MAX_HEIGHT / tempH;
                tempH = MAX_HEIGHT;
            }
        }

        $rootScope.utilService.scopeApply();
        setTimeout(function () {
            $('#cropProfilePictures').modal({ backdrop: 'static', keyboard: false });
            $('.ng-isolate-scope').click().focus().mouseover().mousemove();
            $('.ng-isolate-scope canvas').css({ 'cursor': 'default' }).click().focus().mouseover().mousemove();
            $("#cropArea").width(tempW).height(tempH);

            $rootScope.myImage = $rootScope.Avatar.src;
            $rootScope.utilService.scopeApply();
            $('.ng-isolate-scope').click().focus().mouseover().mousemove();
            $('.ng-isolate-scope canvas').css({ 'cursor': 'default' }).click().focus().mouseover().mousemove();
        }, 500);
    }
    this.saveCropPicture = function () {
        //$('#imgAvatarPicture').attr('src', $('#cropedImage').attr('src'));
        $('#cropProfilePictures').modal('hide');
        $rootScope.Avatar.canSave = 'true';
        $rootScope.Avatar.src = $('#cropedImage').attr('src');
        $rootScope.utilService.scopeApply();
    }
    return this;
});