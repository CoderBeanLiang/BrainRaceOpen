class Main extends egret.DisplayObjectContainer {

    private gameData : any;

    constructor() {
        super();


        wx.onMessage(data => {
            console.log(data);
            if (data.isDisplay) {
                this.processRank(data);
            } else if(data.isScore) {
                this.processData(data);
            } else {
                this.cancelGame();
            }
        });
    }

    private scrollView: egret.ScrollView;
    private bitmapView: egret.Bitmap;
    private panel_bg: egret.Texture;

    private processRank(data: any) {
        //获取小游戏开放数据接口 --- 开始
        wx.getFriendCloudStorage({
            keyList: [ 'score'],
            success: res => {
                console.log(res);
                this.gameData = res.data;
                this.runGame();
            },
            fail: err => {
                console.log(err);
            },
            complete: () => {

            }
        });
        //监听消息 isDisplay

        //获取小游戏开放数据接口 --- 结束        

        // let imageLoader = new egret.ImageLoader();
        // imageLoader.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
        //     let imageLoader = <egret.ImageLoader>event.currentTarget;
        //     this.bgtexture = new egret.Texture();
        //     this.bgtexture._setBitmapData(imageLoader.data);
        // }, this);
        // imageLoader.load("resource/assets/panel_shop_01.png");

        // let imageLoader1 = new egret.ImageLoader();
        // imageLoader1.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
        //     let imageLoader = <egret.ImageLoader>event.currentTarget;
        //     this.panel_01 = new egret.Texture();
        //     this.panel_01._setBitmapData(imageLoader.data);
        // }, this);
        // imageLoader1.load("resource/assets/panel_bg.png");

        // 加载排行榜背景
        let imageLoader = new egret.ImageLoader();
        imageLoader.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
            let loader = <egret.ImageLoader>event.currentTarget;
            this.panel_bg = new egret.Texture();
            this.panel_bg._setBitmapData(loader.data);
        }, this);
        imageLoader.load("resource/assets/panel_bg.png");

    }

    private processData(data: any) {
        wx.getUserCloudStorage({
            keyList: ['score'],
            success: res => {
                let retScore = 0;
                if (res.KVDataList != null && res.KVDataList.length > 0) {
                    retScore = res.KVDataList[0].value;
                }
                let oldScore: Number = new Number(retScore);
                let newScore: Number = new Number(data.score);
                let strScore: String = new String(data.score);

                if(strScore instanceof String) {
                    console.log("String");
                }

                if(newScore > oldScore) {
                    wx.setUserCloudStorage({
                        KVDataList: [{ key: 'score', value: strScore.toString() }],
                        success: res => {
                            console.log(res);
                        },
                        fail: err => {
                            console.log(err);
                        },
                        complete: () => {

                        }
                    });
                }
            },
            fail: err => {
                console.log(err);
            },
            complete: () => {

            }
        });
    }

    private runGame() {
        if (this.contains(this.bitmapView)) { this.removeChild(this.bitmapView); }
        if (this.contains(this.scrollView)) { this.removeChild(this.scrollView); }

        this.bitmapView = new egret.Bitmap(this.panel_bg);
        this.bitmapView.x = (this.stage.stageWidth - this.bitmapView.width) >> 1;
        this.bitmapView.y = (this.stage.stageHeight - this.bitmapView.height) >> 1;
        this.addChild(this.bitmapView);

        this.scrollView = new egret.ScrollView();
        const listContainer = new egret.DisplayObjectContainer();
        this.scrollView.setContent(listContainer);
        this.scrollView.x = this.bitmapView.x + 10;
        this.scrollView.y = this.bitmapView.y + 10;
        this.scrollView.width = this.bitmapView.width - 20;
        this.scrollView.height = this.bitmapView.height - 20;
        this.addChild(this.scrollView);

        this.gameData.sort(function(a,b){
            return b.KVDataList[0].value - a.KVDataList[0].value;
        });
        this.gameData.forEach(
            (value, index) => {

                let itemH = 100;// 每个排行榜项高120
                let itemW = 480;

                let item = new egret.DisplayObjectContainer();
                item.width = itemW;
                item.height = itemH;
                item.y = index * itemH;
                listContainer.addChild(item);

                // let itemBg = new egret.Shape();
                // itemBg.graphics.beginFill(0x0000ff);
                // itemBg.graphics.drawRect(0, 0, itemW, itemH - 1);
                // itemBg.graphics.endFill();
                // item.addChild(itemBg);

                let num = index + 1;
                let numText = new egret.TextField();
                numText.textAlign = egret.HorizontalAlign.CENTER;
                numText.verticalAlign = egret.VerticalAlign.MIDDLE;
                numText.height = item.height;
                numText.width = 80;
                numText.text = num.toString();
                numText.bold = true;
                item.addChild(numText);

                let imageLoader = new egret.ImageLoader;
                imageLoader.once(egret.Event.COMPLETE, (event:egret.Event) => {
                    let loader = <egret.ImageLoader>event.currentTarget;
                    let texture = new egret.Texture();
                    texture._setBitmapData(loader.data);
                    let bmp = new egret.Bitmap(texture);
                    bmp.width = bmp.height = 80;
                    bmp.x = 80;
                    bmp.y = 10;
                    item.addChild(bmp);
                }, this);
                imageLoader.load(value.avatarUrl);

                let nicktxt = new egret.TextField();
                nicktxt.width = 150;
                nicktxt.height = itemH;
                nicktxt.verticalAlign = egret.VerticalAlign.MIDDLE;
                nicktxt.x = 170;
                nicktxt.text = value.nickname;
                item.addChild(nicktxt);

                let numtxt = new egret.TextField();
                numtxt.textAlign = egret.HorizontalAlign.RIGHT;
                numtxt.verticalAlign = egret.VerticalAlign.MIDDLE;
                numtxt.width = 160;
                numtxt.height = itemH;
                numtxt.x = 320;
                numtxt.text = (value.KVDataList[0].value / 100).toFixed(2) + ' 米';
                item.addChild(numtxt);
            }, this);
    }

    private cancelGame(): void {
        for (let i = 0, l = this.numChildren; i < l; i++) {
            this.removeChildAt(0);
        }
        this.scrollView.removeContent();
        console.log('停止开放数据域');
    }
}

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