var express = require('express');
var router = express.Router();
var firebase = require("firebase");
var dateFormat = require('dateformat');

const INDEXDB_DB_NAME = "USER";
const INDEXDB_VERSION = 1;
const INDEXDB_STORE = "Users";

// Cloud Firestore 접속 및 초기화를 위한 admin 설정
const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp(functions.config().firebase);

var db = admin.firestore();

// Firebase 초기설정
var config = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: ""
};
firebase.initializeApp(config);

router.get('/', function(req, res, next) {
    res.redirect('boardList');
});

// 로그인 화면
router.get('/login', function(req, res, next) {
    res.render('diary/login', {title: '로그인', pass: 0});
});

// 로그인 처리
// router.post('/loginChk', function(req, res, next) {
//     firebase.auth().signInWithEmailAndPassword(req.body.id, req.body.passwd)
//        .then(function(firebaseUser) {
//            if(firebase.auth().currentUser.emailVerified) {
//                res.redirect('boardList');
//            } else{
//                firebase.auth().signOut();
//                res.render('diary/login', {title: '로그인', pass: 2});
//            }
//        })
//       .catch(function(error) {
//           switch(error.code){
//               case "auth/invalid-email":
//                 res.render('diary/login', {title: '로그인', pass: 3});
//                 break;
//               case "auth/user-disabled":
//                 res.render('diary/login', {title: '로그인', pass: 4});
//                 break;
//               case "auth/user-not-found":
//                 res.render('diary/login', {title: '로그인', pass: 5});  
//                 break;
//               case "auth/wrong-password":
//                 res.render('diary/login', {title: '로그인', pass: 6});  
//                 break;
//           }
//       });    
// });

// 회원가입 화면
router.get('/signup', function(req, res, next) {
    res.render('diary/signup', {title: '회원가입', pass: 0});
});

// 이메일 가입
// router.post('/emailJoin', function(req, res, next) {
//     var userName = req.body.joinUserName;
//     var email = req.body.joinUserEmail;
//     var password = req.body.joinPassword;
//     var rePassword = req.body.joinRePassword

//     // 유효성 검증
//     if(validateJoinForm(email, password, rePassword) == 0) {
//         var cbCreateUserWithEmail = fun`ction(user){
//             //프로필 업데이트 
//             firebase.auth().currentUser.updateProfile({
//                 displayName: userName,
//             }).then(function() {
//                 console.log('userName 업데이트 성공 : ', JSON.stringify(firebase.auth().currentUser));
//                 // Database에 Users 데이터 저장
//                 var userRef = db.collection('Users').doc(firebase.auth().currentUser.uid);
//                 console.log('saveUserAtDB 저장');
//                 userRef.set({  //데이터 저장
//                     email: firebase.auth().currentUser.email,
//                     profileImg: firebase.auth().currentUser.photoURL ? firebase.auth().currentUser.photoURL : '',
//                     userName : firebase.auth().currentUser.displayName
//                 });
                
//                 console.log('이메일 가입 성공 : ', JSON.stringify(firebase.auth().currentUser));
                
//                 //인증 메일 발송
//                 firebase.auth().useDeviceLanguage(); // 이메일 기기언어로 세팅
//                 firebase.auth().currentUser.sendEmailVerification().then(function() {
//                     console.log('인증메일 발송 성공')
//                 }).catch(function(error) {
//                     console.error('인증메일 발송 에러', error);
//                 });

//                 res.render('diary/login', {title: '로그인', pass: 1});
//             }).catch(function(error) {
//                 console.error('userName 업데이트 실패 : ', error );
//                 res.render('diary/login', {title: '로그인', pass: 7});
//             });
//         }
//         var cbAfterPersistence = function() {
//             return firebase.auth().createUserWithEmailAndPassword(email, password)
//                 .then(cbCreateUserWithEmail.bind(this))
//                 .catch(function(error) {
//                     console.error('이메일 가입시 에러 : ', error);
//                     switch(error.code){
//                         case "auth/email-already-in-use":
//                             res.render('diary/signup', {title: '회원가입', pass: 3});
//                             break;
//                         case "auth/invalid-email":
//                             res.render('diary/signup', {title: '회원가입', pass: 4});
//                             break;
//                         case "auth/operation-not-allowed":
//                             res.render('diary/signup', {title: '회원가입', pass: 5});
//                             break;
//                         case "auth/weak-password":
//                             res.render('diary/signup', {title: '회원가입', pass: 6});
//                             break;
//                     }
//                 });
//         }
        
//         // 원래는 firebase.auth.Auth.Persistence.SESSION이었다.
//         // 왜 SESSION으로 하면 에러가 나고 NONE으로 해야 되는걸까???
//         firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE)
//             .then(cbAfterPersistence.bind(this))
//             .catch(function(error){
//                 console.error('인증 상태 설정 중 에러 발생', error);
//             });
//     } else if(validateJoinForm(email, password, rePassword) == 1){
//         res.render('diary/signup', {title: '회원가입', pass: 1});
//     } else{
//         res.render('diary/signup', {title: '회원가입', pass: 2});
//     }
// });

// 리스트
router.get('/boardList', function(req, res, next) {
    // 로그인이 되어있지 않을 경우 로그인 화면으로 이동
    // if (!firebase.auth().currentUser) {
    //     console.log("로그인 사용자가 없음");
    //     res.redirect('login');
    //     return;
    // } else{
    //     firebase.auth().currentUser.getIdToken(true)
    //         .then(function(idToken){
    //             admin.auth().verifyIdToken(idToken)
    //                 .then(function(decodedToken){
    //                     var uid = decodedToken.uid;
    //                     console.log('현재 사용자: ', decodedToken['name']);
    //                 }).catch(function(e){
    //                     console.log(e);
    //                     console.log("로그인 사용자가 없음");
    //                     res.redirect('login');
    //                 });
    //         }).catch(function(e){
    //             console.log(e);
    //             console.log("로그인 사용자가 없음");
    //             res.redirect('login');
    //         });
    // }


    // 로그인 상태 체크
    // firebase.auth().onAuthStateChanged(function(user){
    //     if(user){
    //         console.log("로그인 상태 : ", JSON.stringify(user));
    //     }else{
    //         console.log("로그인 사용자가 없음");
    //         res.redirect('login');
    //         return;
    //     }
    // });

    db.collection('board').orderBy("brddate", "desc").get()
        .then((snapshot) => {
            var rows = [];
            snapshot.forEach((doc) => {
                var childData = doc.data();
                childData.brddate = dateFormat(childData.brddate, "yyyy-mm-dd");
                rows.push(childData);
            });
            res.render('diary/boardList', {title: '게시판', rows: rows});
            return;
        })
        .catch((err) => {
            console.log('Error getting documents', err);
        });
});

// 글 읽기
// router.get('/boardRead', function(req, res, next) {
//     // 로그인이 되어있지 않을 경우 로그인 화면으로 이동
//     if (!firebase.auth().currentUser) {
//         console.log("로그인 사용자가 없음");
//         res.redirect('login');
//         return;
//     } else{
//         firebase.auth().currentUser.getIdToken(true)
//             .then(function(idToken){
//                 admin.auth().verifyIdToken(idToken)
//                     .then(function(decodedToken){
//                         var uid = decodedToken.uid;
//                         console.log('현재 사용자: ', decodedToken['name']);
//                     }).catch(function(e){
//                         console.log(e);
//                         console.log("로그인 사용자가 없음");
//                         res.redirect('login');
//                     });
//             }).catch(function(e){
//                 console.log(e);
//                 console.log("로그인 사용자가 없음");
//                 res.redirect('login');
//             });
//     }

//     // 로그인 상태 체크
//     // firebase.auth().onAuthStateChanged(function(user){
//     //     if(user){
//     //         console.log("로그인 상태 : ", JSON.stringify(user));
//     //     }else{
//     //         console.log("로그인 사용자가 없음");
//     //         res.redirect('login');
//     //         return;
//     //     }
//     // });

//     db.collection('board').doc(req.query.brdno).get()
//         .then((doc) => {
//             var childData = doc.data();
            
//             childData.brddate = dateFormat(childData.brddate, "yyyy-mm-dd hh:mm");
//             res.render('diary/boardRead', {title: '게시판', row: childData});
//             return;
//         })
//         .catch((err) => {
//             console.log('Error getting documents', err);
//         });
// });

// 글 쓰기, 수정
router.get('/boardForm', function(req,res,next){
    // 로그인이 되어있지 않을 경우 로그인 화면으로 이동
    if (!firebase.auth().currentUser) {
        console.log("로그인 사용자가 없음");
        res.redirect('login');
        return;
    } else{
        firebase.auth().currentUser.getIdToken(true)
            .then(function(idToken){
                admin.auth().verifyIdToken(idToken)
                    .then(function(decodedToken){
                        var uid = decodedToken.uid;
                        console.log('현재 사용자: ', decodedToken['name']);
                    }).catch(function(e){
                        console.log(e);
                        console.log("로그인 사용자가 없음");
                        res.redirect('login');
                    });
            }).catch(function(e){
                console.log(e);
                console.log("로그인 사용자가 없음");
                res.redirect('login');
            });
    }

    // 로그인 상태 체크
    // firebase.auth().onAuthStateChanged(function(user){
    //     if(user){
    //         console.log("로그인 상태 : ", JSON.stringify(user));
    //     }else{
    //         console.log("로그인 사용자가 없음");
    //         res.redirect('login');
    //         return;
    //     }
    // });

    if (!req.query.brdno) { // new
        res.render('diary/boardForm', {title: '게시판', row: ""});
        return;
    }
    
    // update
    db.collection('board').doc(req.query.brdno).get()
          .then((doc) => {
              var childData = doc.data();
              res.render('diary/boardForm', {title: '게시판', row: childData});
              return;
          })
          .catch((err) => {
            console.log('Error getting documents', err);
        });
});

// 저장
router.post('/boardSave', function(req,res,next){
    // 로그인이 되어있지 않을 경우 로그인 화면으로 이동
    var user = firebase.auth().currentUser;
    if (!firebase.auth().currentUser) {
        console.log("로그인 사용자가 없음");
        res.redirect('login');
        return;
    } else{
        firebase.auth().currentUser.getIdToken(true)
            .then(function(idToken){
                admin.auth().verifyIdToken(idToken)
                    .then(function(decodedToken){
                        var uid = decodedToken.uid;
                        console.log('현재 사용자: ', decodedToken['name']);
                    }).catch(function(e){
                        console.log(e);
                        console.log("로그인 사용자가 없음");
                        res.redirect('login');
                    });
            }).catch(function(e){
                console.log(e);
                console.log("로그인 사용자가 없음");
                res.redirect('login');
            });
    }

    var postData = JSON.parse( JSON.stringify(req.body));
    var doc = null;
    if (!postData.brdno) {  // new
        postData.brddate = Date.now();
        doc = db.collection("board").doc();
        postData.brdno = doc.id;
        postData.brdwriter = user.email;
        doc.set(postData);
    } else {                // update
        doc = db.collection("board").doc(postData.brdno);
        doc.update(postData);
    }
    
    res.redirect('boardList');
});

// 글 삭제
router.get('/boardDelete', function(req,res,next){
    // 로그인이 되어있지 않을 경우 로그인 화면으로 이동
    if (!firebase.auth().currentUser) {
        console.log("로그인 사용자가 없음");
        res.redirect('login');
        return;
    } else{
        firebase.auth().currentUser.getIdToken(true)
            .then(function(idToken){
                admin.auth().verifyIdToken(idToken)
                    .then(function(decodedToken){
                        var uid = decodedToken.uid;
                        console.log('현재 사용자: ', decodedToken['name']);
                    }).catch(function(e){
                        console.log(e);
                        console.log("로그인 사용자가 없음");
                        res.redirect('login');
                    });
            }).catch(function(e){
                console.log(e);
                console.log("로그인 사용자가 없음");
                res.redirect('login');
            });
    }

    // 로그인 상태 체크
    // firebase.auth().onAuthStateChanged(function(user){
    //     if(user){
    //         console.log("로그인 상태 : ", JSON.stringify(user));
    //     }else{
    //         console.log("로그인 사용자가 없음");
    //         res.redirect('login');
    //         return;
    //     }
    // });
    
    db.collection('board').doc(req.query.brdno).delete()

    res.redirect('boardList');
});

// 유저 토큰값 추가
// router.post('/updateToken', function(req, res, next){
//     console.log('userToken: ', Object.keys(req.body)[0]);
//     var token = Object.keys(req.body)[0];
//     var tokenRef = db.collection('Users');
//     var query = tokenRef.where('token', '==', token).get()
//         .then(snapshot => {
//             // 이전 토큰값 유저 토큰 초기화
//             snapshot.forEach(doc => {
//                 var tokenUser = db.collection('Users').doc(doc.id);
//                 // tokenUser.get().then(doc => {
//                 //     console.log('이런: ', doc.data());
//                 //     test = doc.data()['token'];
//                 //     console.log('젠장: ', test);
//                 //     return test;
//                 // });
//                 tokenUser.update({
//                     token: ""
//                 });
//             });
//             // 토큰값 추가
//             var userRef = db.collection('Users').doc(firebase.auth().currentUser.uid);
//             userRef.update({
//                 token: token
//             });
//             console.log('토큰값 추가 성공');
//         })
//         .catch(err => {
//             console.log('Error getting documents', err);
//         });
//     res.json(req.body);
// });

// 커플 요청
router.get('/coupleReq', function(req, res, next){
    // 로그인이 되어있지 않을 경우 로그인 화면으로 이동
    // if (!firebase.auth().currentUser) {
    //     console.log("로그인 사용자가 없음");
    //     res.redirect('login');
    //     return;
    // } else{
    //     firebase.auth().currentUser.getIdToken(true)
    //         .then(function(idToken){
    //             admin.auth().verifyIdToken(idToken)
    //                 .then(function(decodedToken){
    //                     var uid = decodedToken.uid;
    //                     console.log('현재 사용자: ', decodedToken['name']);
    //                     res.render('diary/coupleReq', {title: '커플요청'});
    //                 }).catch(function(e){
    //                     console.log(e);
    //                     console.log("로그인 사용자가 없음");
    //                     res.redirect('login');
    //                 });
    //         }).catch(function(e){
    //             console.log(e);
    //             console.log("로그인 사용자가 없음");
    //             res.redirect('login');
    //         });
    // }

    // 로그인 상태 체크
    // firebase.auth().onAuthStateChanged(function(user){
    //     if(user){
    //         console.log("로그인 상태 : ", JSON.stringify(user));
    //         res.render('diary/coupleReq', {title: '커플요청'});
    //     }else{
    //         console.log("로그인 사용자가 없음");
    //         res.redirect('login');
    //         return;
    //     }
    // });
    res.render('diary/coupleReq', {title: '커플요청'});
})

// 커플 요청 푸시알람
router.post('/coupleMsg', function(req, res, next){
    const coupleEmai = req.body.coupleEmail;
    const msgTitle = req.body.userName + '으로부터의 커플 요청이 도착했습니다.';
    const msg = req.body.userName + '님이 회원님을 커플로 등록하기를 요청했습니다. 수락하시겠습니까?';
    console.log('잠깐 이거 뭐가 문제야: ', req.body.userName);
    var coupleUser = null;
    var coupleRef = db.collection('Users');
    var query = coupleRef.where('email', '==', coupleEmai).get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                db.collection('Users').doc(doc.id).get()
                    .then(doc => {
                        if(!doc.exists) {
                            console.log('No such document!');
                            res.redirect('coupleReq');
                        } else {
                            coupleUser = doc.data()['token'];
                            console.log('커플 토큰값: ', coupleUser);
                            const payload = {
                                notification: {
                                    title: msgTitle,
                                    body: msg,
                                    sound: 'default',
                                    click_action: 'https://paralleldiary.firebaseapp.com/',
                                    icon: '\/icons/android-icon-192x192.png'
                                }
                            };
                            admin.messaging().sendToDevice(coupleUser, payload).then(response => {
                                response.results.forEach((result, index) => {
                                    const error = result.error;
                                    if(error) {
                                        console.error('FCM 실패 : ', error.code);
                                    } else{
                                        console.log('FCM 성공');
                                    }
                                });
                            });
                            res.redirect('coupleReq');
                        }
                    })
                    .catch(err => {
                        console.log('Error getting documents', err);
                        res.redirect('coupleReq');
                    });
            });
        })
        .catch(err => {
            console.log('Error getting documents', err);
            res.redirect('coupleReq');
        });
});


module.exports = router;