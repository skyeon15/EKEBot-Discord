const { Twitter, Twitter2, TwitterS, Twitter2S } = require('../config.json');
const { TwitterApi } = require('twitter-api-v2');
var twitter = require('twitter-text');
const Papago = require('./translate');

// 트위터 클라이언트
const twitterClient = new TwitterApi({
    appKey: Twitter,
    appSecret: TwitterS,
    accessToken: Twitter2,
    accessSecret: Twitter2S
}).v2

// 글자 바이트 단위로 자르기
function cutByte(str) {
    for (b = i = 0; c = str.charCodeAt(i);) {
        b += c >> 7 ? 2 : 1;
        if (b > 268)
            break;
        i++;
    }
    return str.substring(0, i);
}

module.exports = {
    async message(message) {
        // 접미사
        var suffix = '\n#VRChat공지'

        // 번역 후 트윗
        Papago.translate(message.content, 'en', 'ko', function (data) {
            // data 없으면 반환
            if(data == undefined || data == ''){
                return
            }

            // 번역된 글자수
            var total = twitter.parseTweet(data).weightedLength

            // 전체 글자가 268 바이트 넘어가면
            if (total > 268) {
                // 글자 배열 생성
                arr = []

                // 남은 글자 바이트가 268 보다 크면
                for (; total > 268; ) {
                    // 분할한 앞 부분
                    var cut = cutByte(data)

                    // 마지막 띄어쓰기 앞부분
                    cut = cut.substring(0, cut.lastIndexOf(' ')).trim()
                    
                    // 분할한 글자 배열에 추가
                    arr.push(cut + suffix)

                    // 분할한 글자 삭제
                    data = data.replace(cut, '')

                    // 남은 글자 바이트 계산
                    total = twitter.parseTweet(data).weightedLength
                }

                // 분할하고 남은 마지막 글자 배열에 추가
                if(data != ''){
                    arr.push(data + suffix)
                }

                // 스레드 게시
                twitterClient.tweetThread(arr).then(result => {
                    console.log(result)
                }).catch(error => {
                    console.log(error?.stack)
                })
            } else {
                // 트윗 게시
                twitterClient.tweet(data + suffix).then(result => {
                    console.log(result)
                }).catch(error => {
                    console.log(error?.stack)
                })
            }
        })
    }
};