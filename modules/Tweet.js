const { Twitter, Twitter2, TwitterS, Twitter2S } = require('../config.json');
const { TwitterApi } = require('twitter-api-v2');
var twitter = require('twitter-text');
const Papago = require('./Papago');

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
    async execute(message) {
        // 번역 후 트윗
        Papago.translate(message.content, 'en', 'ko', function (data) {

                    // 번역된 글자수
        var total = twitter.parseTweet(data).weightedLength

        // 접미사
        var suffix = '\n#테스트'

        // 268 바이트 넘어가면
        if (total > 268) {
            // 글자 배열 생성
            arr = []
            for (let i = 0; i < (total / 268); i++) {
                // 글자수 분할
                var cut = cutByte(data)
                // 분할한 글자 배열에 추가
                arr.push(cut + suffix)
                // 분할한 글자 삭제
                data = data.replace(cut, '')
            }
            // 스레드 게시
            twitterClient.tweetThread(arr).then(result => {
                console.log(result)
            }).catch(error => {
                console.log(error)
            })
        } else {
            // 트윗 게시
            twitterClient.tweet(data + suffix).then(result => {
                console.log(result)
            }).catch(error => {
                console.log(error)
            })
        }
        })
    }
};