const scriptName = "test";
/*
(string) room
(string) sender
(boolean) isGroupChat
(void) replier.reply(message)
(boolean) replier.reply(room, message, )
(string) imageDB.getProfileBase64()
(string) packageName
*/
function isFileExist(filename) {
    return !(DataBase.getDataBase(filename) === null);
}

function checkValidMsg(wordList, cnt, room){
   if(wordList.length === cnt)
      return true;
   else {
      Api.replyRoom(room, "올바르지 않은 입력 형식입니다.")
      return false;
   }
}

function getArray(origin_str) {
   const wordList = origin_str.split('\n');
   return wordList.filter(item => item !== "")
}

function getUsernameList() {
    const userString = DataBase.getDataBase("user_list");

    let userList = getArray(userString);

    return (userList.map(user =>
        user.slice(0, user.indexOf(' '))
    ))
}

function makeDBString(origin_array) {
   return origin_array.reduce((acc, currVal) => acc + '\n' + currVal);
}

function getUsername(sender, room) {
   if(!isFileExist("user_list")){
      Api.replyRoom(room, sender + "님\n" + " 먼저 신규 유저를 생성해주세요.");
       Api.replyRoom(room, "1");
      return undefined;
   }

   const userString = DataBase.getDataBase("user_list");

   let userList = getArray(userString);

   if(!userList.find(item => item.slice(item.indexOf(" ") + 1) === sender)){
      Api.replyRoom(room, sender + "님\n" + " 먼저 신규 유저를 생성해주세요.");
      //userList.forEach(item => {Api.replyRoom(room, item.slice(item.indexOf(" ") + 1));});
   }

   let findedUser = userList.find(item => item.slice(item.indexOf(" ") + 1) === sender);

   return findedUser.slice(0, findedUser.indexOf(' '));
}

function dateFormatTest(datetimeString, room) {
    const dateReg = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])/

    if(datetimeString === '오늘') {
        return true;
    }

    if(!dateReg.test(datetimeString)){
        Api.replyRoom(room, "잘못된 형식의 날짜 표현입니다.\n yyyy-mm-dd 형식으로 입력해주세요.")
        return false;
    }
    return true;
}


function addUser(username, sender, room) {

   if(!isFileExist("user_list")){
      DataBase.setDataBase("user_list", username + " " + sender + "\n")
      DataBase.setDataBase(username + "_" + "list", "")
      Api.replyRoom(room, "환영합니다!" + username + "님\n" + " 루틴 리스트가 생성되었습니다.")
      return;
   }

   DataBase.setDataBase(username + "_" + "list", "")
   DataBase.appendDataBase("user_list", username + " " + sender + "\n")

   Api.replyRoom(room, "환영합니다!" + username + "님\n" + " 루틴 리스트가 생성되었습니다.")
}


function makeRoutine(routineName, sender, room) {
    //띄어쓰기 기준으로 나누어서 배열을 반환

   if(!getUsername(sender, room)) {
      return;
   }

   const username = getUsername(sender, room);

   //counter와 date db 생성
   DataBase.setDataBase(username + "_" + routineName + "_" + "counter", "0\n0\n0");
   DataBase.setDataBase(username + "_" + routineName + "_" + "date", "");
   DataBase.appendDataBase(username + "_" + "list", routineName + "\n");

   Api.replyRoom(room, username + "님의 " + routineName + " 데이터베이스가 생성되었습니다.");
}

function isExist(filename, room) {
   if(!isFileExist(filename)){
      Api.replyRoom(room, "존재하지 않는 파일입니다.")
      return false;
   }
   return true;
}


function deleteDB(filename, room) {
   //띄어쓰기 기준으로 나누어서 배열을 반환

   if(!isExist(filename, room)){
      return;
   }

   DataBase.removeDataBase(filename);

   Api.replyRoom(room, filename + " 삭제 완료.");
}

function checkDB(filename, room) {
   if(!isExist(filename, room)){
      return;
   }

   let returnString = DataBase.getDataBase(filename)

   if(returnString === ""){
      Api.replyRoom(room, "파일이 비어있습니다.")
   }

   Api.replyRoom(room, returnString)
}

function renewDB(filename, newString, room) {
   if(!isExist(filename, room)){
      return;
   }
   
   DataBase.setDataBase(filename, newString)

   Api.replyRoom(room, "갱신완료.")
}

function removeEndDate(routineName, sender, room) {

    const username = getUsername(sender, room);

    if (!username) {
        return;
    }

    if (!isExist(username + "_" + routineName + "_date", room)) {
        return;
    }

    let dateString = DataBase.getDataBase(username + "_" + routineName + "_date");

    if (dateString === "") {
        Api.replyRoom(room, "날짜 리스트가 비어있습니다!")
        return;
    }

    dateList = getArray(dateString);

    let newDateString = makeDBString(dateList);

    DataBase.setDataBase(username + "_" + routineName + "_date", newDateString)

    Api.replyRoom(username + "님의 " + routineName + " 날짜 리스트 끝값이 삭제되었습니다!")

}

function getRoutineList(username, room) {

    let routineString = DataBase.getDataBase(username + "_" + "list")

    if(!routineString){
        Api.replyRoom(room, "루틴 리스트가 비어있습니다!");
        return null;
    }

    let routineList = getArray(routineString);

    return routineList;
}

function getMyRoutine(sender, room) {
    const username = getUsername(sender, room);

    if (!username) {
        return;
    }

    let routineList = getRoutineList(username, room);

    if(!routineList){
        return;
    }

    const routineString = makeDBString(routineList);

    Api.replyRoom(room, routineString);
}

function deleteMyRoutine(routineName, sender, room) {
    const username = getUsername(sender, room);

    if (!username) {
        return;
    }

    let routineList = getRoutineList(username, room);

    if(!routineList){
        return;
    }

    let routineIdx = routineList.indexOf(routineName)

    if(routineIdx == -1){
        Api.replyRoom(room, "삭제하고자 하는 루틴이 리스트에 없습니다!");
        return;
    }

    routineList.splice(routineIdx, 1)

    let newRoutineString = makeDBString(routineList);

    DataBase.setDataBase(username + "_" + "list", newRoutineString)

    Api.replyRoom(room, username + "님의 리스트가 갱신되었습니다!")
    Api.replyRoom(room, newRoutineString)
}

function deleteUsername(username, sender, room) {
    let userString = DataBase.getDataBase("user_list")
    let userList = getArray(userString);

    if(!userString){
        Api.replyRoom(room, "유저 리스트가 비어있습니다!")
        return;
    }

    let userIdx = userList.findIndex(user => user.includes(username));

    if(userIdx == -1){
        Api.replyRoom(room, "삭제하고자 하는 유저가 리스트에 없습니다!")
        return;
    }

    userList.splice(userIdx, 1)

    let newUserString = makeDBString(userList)

    DataBase.setDataBase("user_list", newUserString)

    Api.replyRoom(room, "유저 리스트가 갱신되었습니다!")
    Api.replyRoom(room, newUserString)
}


function getRoutineCnt(username, routineName) {
    let countString = DataBase.getDataBase(username + "_" + routineName +"_counter");
    let countList = countString.split("\n");
    let countNum = countList[0];
    let contiCountNum = countList[1];
    let targetNum = countList[2];
    return ({
        countNum: countNum,
        contiCountNum: contiCountNum,
        targetNum: targetNum,
    })
}

function continuePhrase(contiCountNum, room) {
    if(contiCountNum == 1){
        Api.replyRoom(room, "한 번 습관을 시작해보아요~~")
    } else if (contiCountNum == 3){
        Api.replyRoom(room, "작심삼일을 넘어보자구요~~")
    } else if (contiCountNum == 10){
        Api.replyRoom(room, "열 번 연속이라니~~~ 칭찬해 칭찬해~~~~")
    } else if (contiCountNum == 100){
        Api.replyRoom(room, "백 번 돌파~~~ 오마갓 오마갓~~~~")
    } else if (contiCountNum % 100 == 0){
        Api.replyRoom(room, contiCountNum.toString() + "번을 달성했어요!!! 다들 칭찬 부탁~~~!!!")
    }
}

function addAdditionalZero(numString) {
    return (numString.length === 1) ? ('0' + numString) : numString;
}

function getDateFormat(date, room) {
    return date.getFullYear().toString() + '-' + addAdditionalZero((date.getMonth() + 1).toString()) + '-' + addAdditionalZero((date.getDate()).toString());
}

function getMyRoutinesProcess(sender, room) {
    const username = getUsername(sender, room);

    if (!username) {
        return;
    }

    let routineList = getRoutineList(username, room);

    if(!routineList)
        return;

    let returnString = "";

    routineList.forEach(routineName => {
        const {countNum, contiCountNum} = getRoutineCnt(username, routineName);
        returnString += routineName;
        returnString += ": 연속 ";
        returnString += contiCountNum;
        returnString += "회, 총 ";
        returnString += countNum;
        returnString += "회\n";
    })

    Api.replyRoom(room, returnString);
}

function getTodayRoutineProcess(today, username, routineName) {
    let dateString = DataBase.getDataBase(username + "_" + routineName +"_date");
    let dateList = getArray(dateString);
    if(!dateString) {
        let returnString = "";
        returnString += "❌";
        returnString += routineName;
        returnString += "\n";

        return returnString;
    }

    let lastDay = new Date(dateList[dateList.length-1]);

    if(lastDay.getDate() == today.getDate() && lastDay.getMonth() == today.getMonth() && lastDay.getFullYear() == today.getFullYear()){
        let returnString = "";
        returnString += "✅";
        returnString += routineName;
        returnString += "\n";

        return returnString;
    } else {
        let returnString = "";
        returnString += "❌";
        returnString += routineName;
        returnString += "\n";

        return returnString;
    }
}

function getTodayMyRoutinesProcess(username, room, isReply) {
    let today = new Date();

    //17시간 더해주기
    if(username != "백지원"){
        let diff = 17
        today.setTime(today.getTime() + (17*60*60*1000))
    }

    let routineList = getRoutineList(username, room);

    if(!routineList)
        return;

    let returnString = "";

    returnString += username;
    returnString += "의 현재 시간 : ";
    returnString += today.toString();
    returnString += "\n\n";

    routineList.forEach(routineName => {
        returnString += getTodayRoutineProcess(today, username, routineName);
    })

    returnString += '\n';

    if(isReply)
        Api.replyRoom(room, returnString);

    return returnString;
}

function getTodayRoutinesProcess(room) {
    const usernameList = getUsernameList();

    let returnString = "";

    usernameList.forEach(username =>
        returnString += getTodayMyRoutinesProcess(username, room, false)
    )

    Api.replyRoom(room, returnString);
}

function setRoutineTarget(routineName, target, sender, room) {
    const username = getUsername(sender, room);

    if (!username) {
        return;
    }

    const {countNum, contiCountNum} = getRoutineCnt(username, routineName);

    const numList = [countNum.toString(), contiCountNum.toString(), target.toString()];

    const newCountString = makeDBString(numList);

    renewDB(username + "_" + routineName + "_counter", newCountString, room);
}

function getMonthRoutineProcess(today, username, routineName) {
    let dateString = DataBase.getDataBase(username + "_" + routineName +"_date");
    const {targetNum} = getRoutineCnt(username, routineName);

    let dateList = getArray(dateString);

    if(!dateString) {
        let returnString = '❌';
        returnString += routineName;
        returnString += "\n[";
        returnString += "-".repeat(targetNum);
        returnString += "]\n";

        return returnString;
    }

    let count = 0;

    dateList.forEach(dateString => {
        let currDate = new Date(dateString);
        if(currDate.getMonth() === today.getMonth() && currDate.getFullYear() === today.getFullYear()) {
            count++;
        }
    })

    if(targetNum > count) {
        let returnString = '🏃';
        returnString += routineName;
        returnString += "(목표 달성까지 ";
        returnString += targetNum - count;
        returnString += "회)";
        returnString += "\n[";
        returnString += ">".repeat(count);
        returnString += "-".repeat(targetNum - count);
        returnString += "]\n";

        return returnString;
    } else {
        let returnString = '✅';
        returnString += routineName;
        returnString += "\n[ C L E A R 🥳 ]\n";

        return returnString;
    }
}

function getMonthRoutineProcessDetail(routineName, sender, room) {
    const username = getUsername(sender, room);

    if (!username) {
        return;
    }

    //Todo:
    let today = new Date();

    //17시간 더해주기
    if(username !== "백지원"){
        let diff = 17
        today.setTime(today.getTime() + (17*60*60*1000))
    }

    let dateString = DataBase.getDataBase(username + "_" + routineName +"_date");
    const {targetNum} = getRoutineCnt(username, routineName);

    let dateList = getArray(dateString);

    let currDateList = [];

    dateList.forEach(dateString => {
        let currDate = new Date(dateString);
        if(currDate.getMonth() === today.getMonth() && currDate.getFullYear() === today.getFullYear()) {
            currDateList.push(dateString);
        }
    })

    Api.replyRoom(room, makeDBString(currDateList));
}

function getMonthMyRoutinesProcess(username, room, isReply) {
    let today = new Date();

    //17시간 더해주기
    if(username != "백지원"){
        let diff = 17
        today.setTime(today.getTime() + (17*60*60*1000))
    }

    let routineList = getRoutineList(username, room);

    if(!routineList)
        return;

    let returnString = "<";

    returnString += username;
    returnString += "의 목표 달성 현황 : ";
    returnString += (today.getMonth() + 1);
    returnString += "월>\n\n";

    routineList.forEach(routineName => {
        returnString += getMonthRoutineProcess(today, username, routineName);
    })

    returnString += '\n';

    if(isReply)
        Api.replyRoom(room, returnString);

    return returnString;
}

function getMonthRoutinesProcess(room) {
    const usernameList = getUsernameList();

    let returnString = "";

    usernameList.forEach(username =>
        returnString += getMonthMyRoutinesProcess(username, room, false)
    )

    Api.replyRoom(room, returnString);
}

function finishRoutine(routineName, dateString, sender, room, isReply){
    const username = getUsername(sender, room);

    if (!username) {
        return;
    }

    //다이어리에서 counter 정수 불러오기
    let countString = DataBase.getDataBase(username + "_" + routineName +"_counter")

    if(!countString){
        Api.replyRoom(room, "먼저 " + routineName + "를 생성해주세요.")
        return;
    }

    let {countNum, contiCountNum, targetNum} = getRoutineCnt(username, routineName);
    countNum = Number.parseInt(countNum);
    contiCountNum = Number.parseInt(contiCountNum);

    let dateStringDB = DataBase.getDataBase(username + "_" + routineName + "_date");
    let dateList = getArray(dateStringDB);

    let todayDate = new Date();
    let modifiedTodayDate = new Date();
    modifiedTodayDate.setDate(modifiedTodayDate.getDate() + 1);

    let today = (dateString === '오늘') ? ((username !== '백지원') ? modifiedTodayDate : todayDate) : new Date(dateString);
    let lastDay = new Date(dateList[dateList.length-1]);

    lastDay.setDate(lastDay.getDate() + 1);

    if(countNum == 0){
        contiCountNum += 1;
    } else {
        if(today <= lastDay){
            contiCountNum += 1;
        } else {
            contiCountNum = 1;
        }
    }

    countNum += 1

    let newDate = (username !== '백지원') ? modifiedTodayDate : todayDate;

    let newDateString = (dateString === '오늘') ? getDateFormat(newDate, room) : dateString;

    const counterList = [countNum.toString(), contiCountNum.toString(), targetNum.toString()];
    const counterString = makeDBString(counterList);

    //하나 증가시키고 db에 입력
    DataBase.setDataBase(username + "_" + routineName + "_counter", counterString);

    //날짜 정보 db에 더해주기
    //잘들어가는지 확인을 위해 출력, 이후에는 삭제해도 상관 없음
    DataBase.appendDataBase(username + "_" + routineName + "_" + "date", newDateString + "\n")

    if(isReply)
        Api.replyRoom(room, "축하합니다! " + sender + "님.\n" + countNum.toString() + "번째 " + routineName +  " 완료입니다.\n" + "연속 " + contiCountNum.toString() + "번째입니다.")

    //continuePhrase(contiCountNum, room);

    if(isReply)
        Api.replyRoom(room, getMonthRoutineProcess(newDate, username, routineName));
}

function finishAllRoutine(dateString, sender, room){
    const username = getUsername(sender, room);

    if (!username) {
        return;
    }

    let routineList = getRoutineList(username, room);

    if(!routineList)
        return;

    routineList.forEach(routineName =>{
        finishRoutine(routineName, dateString, sender, room, false);
    })

    getMyRoutinesProcess(sender, room);

    getMonthMyRoutinesProcess(username, room, true);
}

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {

   //!신규유저 김재휘
   if(msg.includes("!신규유저")){
       let wordList = msg.split(' ');
       if(!checkValidMsg(wordList, 2, room)){
           return;
       }
       addUser(wordList[1], sender, room);

       return;
   }

   //!생성 다이어리
   else if(msg.includes("!생성")){
       let wordList = msg.split(" ")
       if(!checkValidMsg(wordList, 2, room)) {
           return;
       }
     makeRoutine(wordList[1], sender, room);

       return;
   }

   //debug용
   //!확인데이터 김재휘_다이어리_counter
   else if(msg.includes("!확인데이터")){
       let wordList = msg.split(" ")
       if(!checkValidMsg(wordList, 2, room)){
           return;
       }
       checkDB(wordList[1], room);

       return;
   }

   //!갱신데이터 김재휘_다이어리_counter 2
   //2
   else if(msg.includes("!갱신데이터")){
       let wordList = msg.split(" ")
       if(!checkValidMsg(wordList, 3, room)){
           return;
       }
       renewDB(wordList[1], wordList[2], room);

       return;
   }

   //!갱신데이터 김재휘_다이어리_counter 2
   //2
   else if(msg.includes("!삭제데이터")){
       let wordList = msg.split(" ");
       if(!checkValidMsg(wordList, 2, room)){
           return;
       }
       deleteDB(wordList[1], room);

       return;
   }

   //!삭제끝값 다이어리
   else if(msg.includes("!삭제끝값")){
       let wordList = msg.split(' ')
       if(!checkValidMsg(wordList, 2, room)){
           return;
       }
        removeEndDate(wordList[1], sender, room);

       return;
   }

   //!나의루틴
   else if(msg.includes("!나의루틴")){
   		getMyRoutine(sender, room);

       return;
   }

   //!삭제루틴 다이어리
   else if(msg.includes("!삭제루틴")){
   		let wordList = msg.split(" ")
   		if(!checkValidMsg(wordList, 2, room)){
      		return;
      	}

      	deleteMyRoutine(wordList[1], sender, room);

       return;
   }

   //!삭제유저 김재휘
   else if(msg.includes("!삭제유저")){
         let wordList = msg.split(" ")

         if(!checkValidMsg(wordList, 2, room)){
            return;
         }

        deleteUsername(wordList[1], sender, room);

       return;
   }

   //!작성완료 2020/03/11
   else if(msg.includes("!작성완료")){
      //띄어쓰기 기준으로 나누어서 배열을 반환
      let wordList = msg.split(" ")

        if(!checkValidMsg(wordList, 2, room)) {
           return;
        }

      //날짜 형식이 맞는지 확인
      if(!dateFormatTest(wordList[1], room)){
        return;
      }

       finishRoutine('다이어리', wordList[1], sender, room, true);

       return;
   }

   //!루틴완료 7시기상 2021-12-20
   else if(msg.includes("!루틴완료")){
         //띄어쓰기 기준으로 나누어서 배열을 반환
       //띄어쓰기 기준으로 나누어서 배열을 반환
       let wordList = msg.split(" ")

       if(!checkValidMsg(wordList, 3, room)) {
           return;
       }

       //날짜 형식이 맞는지 확인
       if(!dateFormatTest(wordList[2], room)){
           return;
       }

       finishRoutine(wordList[1], wordList[2], sender, room, true);

       return;
   }

   //!루틴올클 2021-12-20
   else if(msg.includes("!루틴올클")){
       //띄어쓰기 기준으로 나누어서 배열을 반환
       //띄어쓰기 기준으로 나누어서 배열을 반환
       let wordList = msg.split(" ")

       if(!checkValidMsg(wordList, 2, room)) {
           return;
       }

       //날짜 형식이 맞는지 확인
       if(!dateFormatTest(wordList[1], room)){
           return;
       }

       finishAllRoutine(wordList[1], sender, room);

       return;
   }

   //!현황
   else if (msg.includes("!현황")){
       getMyRoutinesProcess(sender, room);

       return;
   }

   else if (msg === "!오늘"){
       getTodayRoutinesProcess(room);

       return;
   }

   //!오늘 김재휘
   else if (msg.includes("!오늘")){
       let wordList = msg.split(" ")

       if(!checkValidMsg(wordList, 2, room)){
           return;
       }

      getTodayMyRoutinesProcess(wordList[1], room, true);

       return;
   }

   //!목표설정 루틴이름 횟수
   else if(msg.includes('!목표설정')){
       let wordList = msg.split(" ")

       if(!checkValidMsg(wordList, 3, room)){
           return;
       }

        setRoutineTarget(wordList[1], Number.parseInt(wordList[2]), sender, room);

       return;
   }

   //!이번달상세 {루틴이름}
   else if (msg.includes("!이번달상세")){
       let wordList = msg.split(" ")

       if(!checkValidMsg(wordList, 2, room)){
           return;
       }

       getMonthRoutineProcessDetail(wordList[1], sender, room);

       return;
   }

   else if (msg === "!이번달"){
       getMonthRoutinesProcess(room);

       return;
   }

   else if (msg.includes("!이번달")){
       let wordList = msg.split(" ")

       if(!checkValidMsg(wordList, 2, room)){
           return;
       }

       getMonthMyRoutinesProcess(wordList[1], room, true);

       return;
   }


   else if(msg === "!힘내 백지" || msg === "!힘내 백지원" || msg === "!힘내 캘리" || msg === "!힘내 지원"){
         replier.reply(room, "미래인재 일동은 백지를 응원합니다~!~!")
         return;
   }

   // else if(msg == "!테스트파일"){
   //     const userString = DataBase.getDataBase('user_list');
   //     Api.replyRoom(room, userString);
   //     return;
   // }

   else if(msg === "!유노윤호모드" || msg === "!유노윤호"){
         let data = Utils.getWebText("https://chavo-s-it-life.tistory.com/71")
         data = data.replace(/<[^>]+>/g,""); //태그 삭제
         data = data.split("명언시작")[1]
         data = data.split("명언끝")[0]
         data = data.trim()

         awesomeWordList = data.split("\n")

         replier.reply(awesomeWordList[Math.floor(Math.random() * awesomeWordList.length)].trim())
   }

   else if (msg === "!규칙" || msg === "!사용법"){
   		let returnString = ""
       returnString += "----ver2. 주요 변화----\n"
       returnString += "이제 대부분의 명령어에서 본인 이름을 쓰지 않아도 됩니다. 메세지 전송자의 정보를 받아 자동으로 처리합니다.\n";
       returnString += "날짜 대신 '오늘'을 적으면 자동으로 오늘 날짜의 기록이 만들어집니다.\n";
       returnString += "루틴별 한 달 목표 횟수를 정해줄 수 있습니다. 목표 달성을 할 시에는 꼭 ritual을 가지고 인증사진을 공유할 수 있도록 합시다.🥳\n";
       returnString += "---------------------\n"
       returnString += "0. !신규유저 {본인 이름}\n"
         returnString += "ex) !신규유저 김재휘\n\n"
         returnString += "신규유저가 들어왔을 때 루틴 리스트를 저장하기 위한 용도로 사용됩니다. !신규유저를 안하신 분들은 꼭 해주세요~\n\n"
   		returnString += "1. !생성 {루틴 이름}\n"
   		returnString += "ex) !생성 다이어리\n\n"
   		returnString += "루틴을 추가하기 위한 용도로 사용합니다. 작성완료의 경우 '다이어리'를 default 값을 가지므로 반드시 다이어리는 루틴에 추가해주세요.\n\n"
   		returnString += "2. !작성완료 {날짜}\n"
   		returnString += "ex) !작성완료 2021-02-23\n\n"
        returnString += "ex) !작성완료 오늘\n\n"
   		returnString += "다이어리 작성을 기록하기 위한 용도로 사용합니다. 날짜가 아닌 오늘으로 적으면 자동으로 오늘의 날짜를 적어줍니다. 날짜는 반드시 yyyy-mm-dd 양식으로 만들어주세요.\n\n"
   		returnString += "3. !루틴완료 {루틴 이름} {날짜}\n"
   		returnString += "ex) !루틴완료 7시아침기상 2021-02-23\n\n"
   		returnString += "루틴 완료를 기록하기 위한 용도로 사용합니다. 날짜 형식은 !작성완료와 같습니다.\n\n"
   		returnString += "4. !나의루틴\n"
   		returnString += "ex) !나의루틴\n\n"
   		returnString += "본인의 루틴 리스트를 확인할 수 있습니다.\n\n"
   		returnString += "5. !삭제루틴 {루틴 이름}\n"
   		returnString += "ex) !삭제루틴 7시아침기상\n\n"
   		returnString += "본인의 루틴 중 하나를 루틴 리스트에서 삭제할 수 있습니다.\n\n"
   		returnString += "6. !삭제끝값 {루틴 이름}\n"
   		returnString += "ex) !삭제끝값 7시아침기상\n\n"
   		returnString += "날짜 입력을 잘못한 경우 해당 루틴의 날짜 끝값을 삭제할 수 있습니다.\n\n"
   		returnString += "7. !현황\n"
   		returnString += "ex) !현황\n\n"
   		returnString += "나의 루틴의 달성 현황을 확인할 수 있습니다.\n\n"
   		returnString += "8. !오늘 {본인 이름}\n"
   		returnString += "ex) !오늘 김재휘\n\n"
   		returnString += "오늘 나의 루틴의 달성 현황을 확인할 수 있습니다.\n\n"
   		returnString += "9. !오늘\n\n"
   		returnString += "오늘 멤버들의 다이어리 작성 현황을 확인할 수 있습니다.\n\n"
       returnString += "10. !이번달\n\n"
       returnString += "이번달 나의 다이어리 작성 현황을 확인할 수 있습니다.\n\n"
         returnString += "11. !이번달\n\n"
         returnString += "이번달 멤버들의 다이어리 작성 현황을 확인할 수 있습니다.\n\n"
         returnString += "12. !삭제유저 {유저 이름}\n"
         returnString += "ex) !삭제유저 김재휘\n\n"
         returnString += "유저 중 한 명을 루틴 리스트에서 삭제할 수 있습니다.\n\n"
       returnString += "-------ver 2.---------\n"
       returnString += "13. !목표설정 {루틴 이름} {횟수}\n"
       returnString += "ex) !목표설정 다이어리 20\n\n"
       returnString += "한 달동안 달성할 목표의 횟수를 설정할 수 있습니다.\n\n"
       returnString += "14. !루틴올클 {날짜}\n"
       returnString += "ex) !루틴올클 오늘\n\n"
       returnString += "나의 루틴들을 모두 완료했다고 기록하는 명령입니다.\n\n"

   		replier.reply(room, returnString)
   }


}