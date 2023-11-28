const app = getApp();
Page({
  data: {
    questions: [
      { imgUrl: 'https://d.bmcx.com/shouyu/_file/1/dcf91244457af79a.png', answer: '' },
      { imgUrl: 'https://d.bmcx.com/shouyu/_file/7/048ddc963de66e63.png', answer: '' },
      { imgUrl: 'https://d.bmcx.com/shouyu/_file/3/a506195556ba346c.png', answer: '' }
    ],
    current: 0,
    res_src:'',
    hidden_new:true,
    hidden_more:true,
    hidden_submit:false,
    hidden_swiper:false,
    hidden_indicator:false
  },
  onLoad: function () {
    this.setData({
      current: 0
    })
  },
  swiperChange: function(e) {
    const { source, current } = e.detail;
    if (source === 'touch') {
      const { current: prevCurrent } = this.data;
      if (current > prevCurrent) {
        this.setData({
          current: current
        });
      } else if (current < prevCurrent) {
        if (prevCurrent > 0) {
          this.setData({
            current: prevCurrent - 1
          });
        }
      }
    }
  },
  onInputChange(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const { questions } = this.data;
    questions[index].answer = value;
    this.setData({
      questions: questions
    });
  },
  submitAnswer: function () {
    console.log('submitAnswer triggered');
    this.setData({
      hidden_swiper:true,
    })
    const { questions } = this.data;
    const answerList = questions.map(item => item.answer); // 提取答案数组
    console.log('answerList:', answerList);
    const correctAnswers = ['你好', '我要回家', '你吃饭了吗']; // 设置正确的答案数组
    if (answerList.some(item => !item)) { // 存在未填写答案的问题
      wx.showToast({
        title: '请回答完整',
        icon: 'none'
      })
      const currentIndex = answerList.findIndex(item => !item); // 获取第一个未填写答案的问题的索引
    this.setData({
          current: currentIndex,
          hidden_swiper:false
    });

    } else { 
      const isAllCorrect = answerList.every((item, index) => item === correctAnswers[index]); // 判断所有答案是否都与设置的答案相同
      if (isAllCorrect) {
        this.setData({
          res_src:'../../image/game/成功.png',
          hidden_new:false,
          hidden_submit:true,
          hidden_indicator:true
        })
        app.globalData.success_round_2 = true;
       }
       else {
        this.setData({
          res_src:'../../image/game/失败.png',
          hidden_more:false,
          hidden_submit:true,
          hidden_indicator:true
        })
      }
    }
    console.log(this.data.res_src)
  },
  //再来一轮
  more:function(){
    wx.navigateTo({
      url: '/ROUND/round_1/round_1',
    })    
  },
  //下一局
  new: function() {
    console.log("开始2");
  
    wx.navigateTo({
      url: '../round_2/round_2',
  })
}
})
