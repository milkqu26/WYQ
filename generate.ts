const App = getApp()
const innerAudioContext = wx.createInnerAudioContext();
var plugin = requirePlugin("WechatSI");
let manager = plugin.getRecordRecognitionManager();
Page({
  data: {
    audioUrl: '',
    showSpeedPicker: false,
    tempFilePath: ' ',
    hidden_actionSheet: true,
    currentImage: '../../image/三角形.png',
    image_1: '../../image/三角形.png',
    image_2: '../../image/播放中.png',
    like_src: '../../image/收藏.png',
    isPlayAudio: false,
    audioSeek: 0,
    audioDuration: 0,
    showTime1: '00:00',
    showTime2: '00:00',
    audioTime: 0,
    autiospeed: 1,
    hidden_vedio: true,
    videoSrc: '',
    recording: false,
    recorderManager: null,
    img_src: '../../image/213麦克风.png',
    img_1: '../../image/213麦克风.png',
    img_2: '../../image/录音 (1).png',
    showMask: true,
    recognizedText: '', // 语音识别结果
    isRecognizing: false, // 是否正在进行语音识别
    recognitionResult: '',
    warn: '请在此输入您想要翻译的文字或点击上面开始录音',
    hidden_flow: true,
    showModal: false,
    historyList: ['历史记录1', '历史记录2', '历史记录3', '4',],
    modalContent: {
      text: '',
    },
    selectedHistory: '',
    x: 0, // 元素的初始横向位置
    y: 0, // 元素的初始纵向位置
  },
  // 悬浮窗移动
  touchStart(e) {
    // 记录触摸开始时的位置
    this.startX = e.touches[0].clientX;
    this.startY = e.touches[0].clientY;
  },

  touchMove(e) {
    // 计算触摸移动的距离
    const offsetX = e.touches[0].clientX - this.startX;
    const offsetY = e.touches[0].clientY - this.startY;

    // 更新元素的位置
    this.setData({
      x: this.data.x + offsetX,
      y: this.data.y + offsetY,
    });

    // 更新触摸开始时的位置
    this.startX = e.touches[0].clientX;
    this.startY = e.touches[0].clientY;
  },
  onLoad: function () {
    manager.onStop = (res) => {
      manager.onRecognize(res); // 在停止录音后调用 onRecognize 方法
    };
    manager.onRecognize = (res) => {
      console.log('开始识别');
      console.log(res); // 输出语音识别结果
      if (res && res.result) {
        console.log("current result", res.result);
        this.setData({
          recognitionResult: res.result,
        });
      } else {
        this.setData({
          warn: '未检测到语音',
        });
        console.error("无效的语音识别结果");
      }
    };
  },
  flowty_window: function () {
    if (this.data.hidden_flow) {
      this.setData({
        hidden_flow: false
      })
      return;
    }
    if (!this.data.hidden_flow) {
      this.setData({
        hidden_flow: true
      })
      return;
    }
  },
  history: function () {
    // 发送请求到服务器获取历史记录数据
    wx.request({
      // url: 'http://127.0.0.1:8081/api/get_history',
      url: 'http://172.20.10.3:8081/api/get_history',
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({ query: "1" }),
      success: (res) => {
        if (res.statusCode === 200) {
          console.log(res)
          const historyList = res.data.map(item => item.search_query);
          this.setData({
            historyList: historyList
          });
        } else {
          console.error('获取出现错误');
        }
      },
      fail: (error) => {
        console.error('获取出现错误:', error);
      }
    });
    this.setData({
      //historyList: newHistoryList,
      showModal: true,
      hidden_flow: false,
    });
  },
  show_history: function (event) {
    const index = event.currentTarget.dataset.index;
    console.log(index)
    const selectedHistory = this.data.historyList[index];
    console.log(selectedHistory)
    this.setData({
      recognitionResult: selectedHistory,
      showModal: false,
      hidden_flow: true
    });
  },
  like: function () {
    this.setData({
      like_src: '../../image/已收藏.png'
    })
  },
  cancel: function () {
    this.setData({
      showModal: false,
      hidden_flow: true
    })
  },
  hideComponent: function () {
    this.setData({
      showMask: true,
      hidden_actionSheet: true
    })
  },
  onShow: function () {
    this.Initialization();
    this.loadaudio();
  },
  //开始录音
  start: function () {
    this.setData({
      hidden_actionSheet: false,
      showMask: false,
    })
  },
  startRecord: function (e) {
    this.setData({
      recording: true,
      img_src: this.data.img_2
    });
    manager.start({ duration: 30000, lang: "zh_CN" });
  },
  // 调用示例
  stopRecord: function (e) {
    if (this.data.recording) {
      manager.stop();
      this.setData({
        recording: false,
        img_src: this.data.img_1,
        hidden_actionSheet: true,
        showMask: true
      });
    }
    var that = this;
    const recorderManager = wx.getRecorderManager();
    recorderManager.onStop((res) => {
      that.setData({
        tempFilePath: res.tempFilePath // 文件临时路径
      })
      console.log('获取到文件：' + that.data.tempFilePath);
    });
  },
  out_textout_text: function (e) {
    this.setData({
      recognitionResult: e.detail.value,
    });
  },
  startGenerate() {
    console.log("开始生成")
    this.saveSearchQuery();
    wx.showLoading({
      title: '正在生成视频...',
    });
    wx.request({
      url: 'https://10.133.91.103:5173/generator',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        sentence: this.data.recognitionResult
      },
      success(res) {
        wx.hideLoading();
        if (res.statusCode === 200) {
          const videoUrl = res.data.fileUrl;
          wx.showToast({
            title: '视频生成成功！',
            icon: 'success'
          });
          // 播放视频
          this.setData({
            videoSrc: videoUrl,
            hidden_vedio: false
          });
        } else {
          wx.showToast({
            title: '视频生成失败，请重试！',
            icon: 'none'
          });
        }
      },
      fail(res) {
        wx.hideLoading();
        wx.showToast({
          title: '网络请求失败，请重试！',
          icon: 'none'
        });
        console.log(res);
      }
    });
  },
  //保存搜索记录
  saveSearchQuery() {
    console.log(this.data.recognitionResult);
    const data = {
      query: this.data.recognitionResult,
    };
    console.log("文字", data);
    wx.request({
      // url: 'http://127.0.0.1:8080/api/save',
      url: 'http://172.20.10.3:8080/api/save',
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(data),
      success: (res) => {
        if (res.statusCode === 200) {
          console.log('搜索记录已保存');
        } else {
          console.error('保存搜索记录时出现错误');
        }
      },
      fail: (error) => {
        console.error('保存搜索记录时出现错误:', error);
      },
      complete: () => {
        this.getSearchQuery();
      }
    });
  },
  //获得搜索记录
  getSearchQuery() {
    wx.request({
      // url: 'http://127.0.0.1:8081/api/get_history',
      url: 'http://172.20.10.3:8081/api/get_history',
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({ query: "1" }),
      success: (res) => {
        if (res.statusCode === 200) {
          console.log(res)
          const historyList = res.data.map(item => item.search_query);
          this.setData({
            historyList: historyList
          });
        } else {
          console.error('获取出现错误');
        }
      },
      fail: (error) => {
        console.error('获取出现错误:', error);
      }
    });
  },
  //初始化播放器，获取duration
  Initialization() {
    var t = this;
    if (this.data.tempFilePath.length != 0) {
      innerAudioContext.src = this.data.tempFilePath;
      if (innerAudioContext.src !== null) {
        innerAudioContext.play();
        innerAudioContext.onCanplay(() => {
          innerAudioContext.duration
          setTimeout(function () {
            var duration = innerAudioContext.duration;
            var min = parseInt(duration / 60);
            var sec = parseInt(duration % 60);
            if (min.toString().length == 1) {
              min = `0${min}`;
            }
            if (sec.toString().length == 1) {
              sec = `0${sec}`;
            }
            t.setData({ audioDuration: innerAudioContext.duration, showTime2: `${min}:${sec}` });
          }, 1000)
        })
      }
    }
  },
  //拖动进度条事件
  sliderChange(e: { detail: { value: any; }; }) {
    if (this.data.tempFilePath == ' ') {
      this.setData({
        showTime2: '00:00',
        showTime1: '00:00',
        audioTime: 0,
        audioDuration: 0,
        currentImage: this.data.image_1,
      })
      wx.showToast({
        title: '没有音频文件',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    innerAudioContext.src = this.data.tempFilePath;
    console.log(innerAudioContext.src);
    var value = e.detail.value;
    this.setData({ audioTime: value });
    var duration = this.data.audioDuration;
    value = parseFloat(value * duration / 100);
    this.setData({ audioSeek: value, isPlayAudio: true });
    innerAudioContext.seek(value);
    innerAudioContext.play();
  },
  //播放、暂停按钮
  playAudio() {
    if (this.data.tempFilePath == ' ') {
      this.setData({
        showTime2: '00:00',
        showTime1: '00:00',
        audioTime: 0,
        audioDuration: 0,
        currentImage: this.data.image_1,
      })
      wx.showToast({
        title: '没有音频文件',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (this.data.currentImage === this.data.image_1) {
      this.setData({
        currentImage: this.data.image_2
      });
    }
    innerAudioContext.autoplay = false
    innerAudioContext.playbackRate = 1;
    var isPlayAudio = this.data.isPlayAudio;
    var seek = this.data.audioSeek;
    innerAudioContext.play();
    this.setData({ isPlayAudio: !isPlayAudio })
    if (isPlayAudio) {
      this.setData({
        audioSeek: innerAudioContext.currentTime,
        currentImage: this.data.image_1
      });
    } else {
      innerAudioContext.src = this.data.tempFilePath;
      if (innerAudioContext.duration != 0) {
        this.setData({
          audioDuration: innerAudioContext.duration,
          currentImage: this.data.image_2
        });
      }
      innerAudioContext.seek(seek);
      innerAudioContext.play();
    }
  },
  loadaudio() {
    var that = this;
    that.data.durationIntval = setInterval(function () {
      if (that.data.isPlayAudio == true) {
        var seek = that.data.audioSeek;
        var duration = innerAudioContext.duration;
        var time = that.data.audioTime;
        time = parseFloat(100 * seek / duration);
        var min = parseInt((seek + 1) / 60);
        var sec = parseInt((seek + 1) % 60);
        if (min.toString().length == 1) {
          min = `0${min}`;
        }
        if (sec.toString().length == 1) {
          sec = `0${sec}`;
        }
        var min1 = parseInt(duration / 60);
        var sec1 = parseInt(duration % 60);
        if (min1.toString().length == 1) {
          min1 = `0${min1}`;
        }
        if (sec1.toString().length == 1) {
          sec1 = `0${sec1}`;
        }
        if (time > 100) {
          innerAudioContext.stop();
          that.setData({
            audioSeek: 0,
            audioTime: 0,
            audioDuration: duration,
            isPlayAudio: false,
            showTime1: `00:00`,
            currentImage: that.data.image_1
          });
          return false;
        }
        that.setData({ audioSeek: seek + 1, audioTime: time, audioDuration: duration, showTime1: `${min}:${sec}`, showTime2: `${min1}:${sec1}` });
      }
    }, 1000);
  },
  onUnload: function () {
    clearInterval(this.data.durationIntval);
  },
  showSpeedPicker: function () {
    this.setData({
      showSpeedPicker: !this.data.showSpeedPicker
    });
  },
  changeSpeed: function (e: { currentTarget: { dataset: { speed: string; }; }; }) {
    var speed = parseFloat(e.currentTarget.dataset.speed);
    console.log(speed);
    this.setData({
      showSpeedPicker: false,
      autiospeed: speed
    });
    // const audioContext = wx.createInnerAudioContext();
    console.log("autiospeed:::" + this.data.autiospeed)
    innerAudioContext.src = this.data.tempFilePath;
    innerAudioContext.playbackRate = speed;
    //正常播放中的
    if (this.data.isPlayAudio == true) {
      var seek = this.data.audioSeek;
      innerAudioContext.startTime = seek; // 设置跳转的时间点
      innerAudioContext.play();
    }
  },
  showVolume: function () {
    this.setData({
      hidden_volume: false
    })
  },
  showVedio: function () {
    console.log("yes")
    this.setData({
      hidden_vedio: false,
      videoSrc: ''
    })
  }
});