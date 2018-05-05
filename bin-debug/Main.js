var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = this && this.__extends || function __extends(t, e) { 
 function r() { 
 this.constructor = t;
}
for (var i in e) e.hasOwnProperty(i) && (t[i] = e[i]);
r.prototype = e.prototype, t.prototype = new r();
};
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        var _this = _super.call(this) || this;
        wx.onMessage(function (data) {
            console.log(data);
            if (data.isDisplay) {
                _this.processRank(data);
            }
            else if (data.isScore) {
                _this.processData(data);
            }
            else {
                _this.cancelGame();
            }
        });
        return _this;
    }
    Main.prototype.processRank = function (data) {
        var _this = this;
        //获取小游戏开放数据接口 --- 开始
        wx.getFriendCloudStorage({
            keyList: ['score'],
            success: function (res) {
                console.log(res);
                _this.gameData = res.data;
                _this.runGame();
            },
            fail: function (err) {
                console.log(err);
            },
            complete: function () {
            }
        });
        //监听消息 isDisplay
        //获取小游戏开放数据接口 --- 结束        
        var imageLoader = new egret.ImageLoader();
        imageLoader.addEventListener(egret.Event.COMPLETE, function (event) {
            var imageLoader = event.currentTarget;
            _this.bgtexture = new egret.Texture();
            _this.bgtexture._setBitmapData(imageLoader.data);
        }, this);
        imageLoader.load("resource/assets/panel_shop_01.png");
        var imageLoader1 = new egret.ImageLoader();
        imageLoader1.addEventListener(egret.Event.COMPLETE, function (event) {
            var imageLoader = event.currentTarget;
            _this.panel_01 = new egret.Texture();
            _this.panel_01._setBitmapData(imageLoader.data);
        }, this);
        imageLoader1.load("resource/assets/panel_bg.png");
    };
    Main.prototype.processData = function (data) {
        wx.getUserCloudStorage({
            keyList: ['score'],
            success: function (res) {
                var retScore = 0;
                if (res.KVDataList != null && res.KVDataList.length > 0) {
                    retScore = res.KVDataList[0].value;
                }
                var oldScore = new Number(retScore);
                var newScore = new Number(data.score);
                var strScore = new String(data.score);
                if (strScore instanceof String) {
                    console.log("String");
                }
                if (newScore > oldScore) {
                    wx.setUserCloudStorage({
                        KVDataList: [{ key: 'score', value: strScore.toString() }],
                        success: function (res) {
                            console.log(res);
                        },
                        fail: function (err) {
                            console.log(err);
                        },
                        complete: function () {
                        }
                    });
                }
            },
            fail: function (err) {
                console.log(err);
            },
            complete: function () {
            }
        });
    };
    Main.prototype.runGame = function () {
        var _this = this;
        if (this.contains(this.bitmapView)) {
            this.removeChild(this.bitmapView);
        }
        if (this.contains(this.scrollView)) {
            this.removeChild(this.scrollView);
        }
        this.bitmapView = new egret.Bitmap(this.panel_01);
        this.bitmapView.x = (640 - 480) >> 1;
        this.bitmapView.y = (1136 - 800) >> 1;
        this.addChild(this.bitmapView);
        this.scrollView = new egret.ScrollView();
        var listContainer = new egret.DisplayObjectContainer();
        this.scrollView.setContent(listContainer);
        this.scrollView.x = this.bitmapView.x;
        this.scrollView.y = this.bitmapView.y;
        this.scrollView.width = this.bitmapView.width;
        this.scrollView.height = this.bitmapView.height;
        this.addChild(this.scrollView);
        this.gameData.sort(function (a, b) {
            return b.KVDataList[0].value - a.KVDataList[0].value;
        });
        this.gameData.forEach(function (value, index) {
            var item = new egret.DisplayObjectContainer();
            item.y = index * 130;
            listContainer.addChild(item);
            var bitmap = new egret.Bitmap(_this.bgtexture);
            bitmap.width = _this.scrollView.width;
            item.addChild(bitmap);
            var avatar = new egret.Bitmap();
            avatar.height = bitmap.height;
            avatar.width = avatar.height;
            item.addChild(avatar);
            var imageLoader = new egret.ImageLoader;
            imageLoader.once(egret.Event.COMPLETE, _this.imageLoadHandler, avatar);
            var nicktxt = new egret.TextField();
            nicktxt.x = avatar.width;
            nicktxt.y = 50;
            nicktxt.text = value.nickname;
            item.addChild(nicktxt);
            var numtxt = new egret.TextField();
            numtxt.x = 260;
            numtxt.y = 50;
            numtxt.text = (value.KVDataList[0].value / 100).toFixed(2) + ' 米';
            item.addChild(numtxt);
        }, this);
    };
    Main.prototype.cancelGame = function () {
        for (var i = 0, l = this.numChildren; i < l; i++) {
            this.removeChildAt(0);
        }
        this.scrollView.removeContent();
        console.log('停止开放数据域');
    };
    Main.prototype.imageLoadHandler = function (evt, avatar) {
        var loader = evt.currentTarget;
        var bmpData = loader.data;
        avatar.$setBitmapData(bmpData);
    };
    return Main;
}(egret.DisplayObjectContainer));
__reflect(Main.prototype, "Main");
// // 微信关系数据的获取
// // 上传方法类似、开发者自行填写
// declare namespace wx {
//     /**
//      * 监听消息
//      */
//     const onMessage: (callback: (data: { [key: string]: any }) => void) => void;
//     /**
//      * 拉取当前用户所有同玩好友的托管数据。该接口只可在开放数据域下使用
//      * @param keyList 要拉取的 key 列表
//      * @param success 接口调用成功的回调函数
//      * @param fail 	接口调用失败的回调函数
//      * @param complete 接口调用结束的回调函数（调用成功、失败都会执行）
//      */
//     const getFriendCloudStorage: (Object: {
//         keyList?: string[],
//         success?: (res: {
//             data: UserGameData[]
//         }) => void,
//         fail?: (err: any) => void,
//         complete?: () => void,
//     }) => void;
//     /**
//      * 在小游戏是通过群分享卡片打开的情况下，可以通过调用该接口获取群同玩成员的游戏数据。该接口只可在开放数据域下使用。
//      * @param shareTicket 群分享对应的 shareTicket
//      * @param keyList 要拉取的 key 列表
//      * @param success 接口调用成功的回调函数
//      * @param fail 接口调用失败的回调函数
//      * @param complete 接口调用结束的回调函数（调用成功、失败都会执行）
//      */
//     const getGroupCloudStorage: (Object: {
//         shareTicket: string,
//         keyList: string[],
//         success?: (res: {
//             data: UserGameData[]
//         }) => void,
//         fail?: (err?: any) => void,
//         complete?: () => void,
//     }) => void;
//     /**
//      * 用户数据
//      */
//     type UserGameData = {
//         /** 用户的微信头像 url */
//         avatarUrl: string,
//         /** 用户的微信昵称 */
//         nickName: string,
//         /** 用户的 openId */
//         openId: string,
//         /**用户自定义数据 */
//         KVList: KVData[]
//     }
//     type KVData = {
//         key: string,
//         value: string
//     }
// } 
//# sourceMappingURL=Main.js.map