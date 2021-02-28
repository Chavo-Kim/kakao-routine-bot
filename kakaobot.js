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

function makeDBString(origin_array) {
   return origin_array.reduce((acc, currVal) => acc + currVal + '\n');
}

function getUsername(sender, room) {
   if(Database.exists("user_list")){
      Api.replyRoom(room, sender + "님\n" + " 먼저 신규 유저를 생성해주세요.")
      return undefined;
   }

   const userString = DataBase.getDataBase("user_list");

   let userList = getArray(userString);

   if(!userList.find(item => item.split(" ")[1] === sender)){
      Api.replyRoom(room, sender + "님\n" + " 먼저 신규 유저를 생성해주세요.")
   }

   return userList.find(item => item.split(" ")[1] === sender);
}

function addUser(msg, sender, room) {
   let wordList = msg.split(" ")

   if(!checkValidMsg(wordList, 2, room)){
         return;
   }

   if(!Database.exists("user_list")){
      DataBase.setDataBase("user_list", wordList[1] + " " + sender + "\n")
      DataBase.setDataBase(wordList[1] + "_" + "list", "")
      Api.replyRoom(room, "환영합니다!" + wordList[1] + "님\n" + " 루틴 리스트가 생성되었습니다.")
      return;
   }

   DataBase.setDataBase(wordList[1] + "_" + "list", "")
   DataBase.appendDataBase("user_list", wordList[1] + "\n")

   Api.replyRoom(room, "환영합니다!" + wordList[1] + "님\n" + " 루틴 리스트가 생성되었습니다.")
}


function makeRoutine(msg, sender, room) {
    //띄어쓰기 기준으로 나누어서 배열을 반환
   let wordList = msg.split(" ")

   if(!checkValidMsg(wordList, 2, room)) {
      return;
   }

   if(!getUsername(sender, room)) {
      return;
   }

   const username = getUsername(sender, room);

   //counter와 date db 생성
   DataBase.setDataBase(username + "_" + wordList[1] + "_" + "counter", "0\n0")
   DataBase.setDataBase(username + "_" + wordList[1] + "_" + "date", "")
   DataBase.appendDataBase(username + "_" + "list", wordList[1] + "\n")

   Api.replyRoom(room, username + "님의 " + wordList[1] + " 데이터베이스가 생성되었습니다.")

}

function isExist(filename, room) {
   if(!Database.exists(filename)){
      Api.replyRoom(room, "존재하지 않는 파일입니다.")
      return false;
   }
   return true;
}


function deleteDB(msg, room) {
   //띄어쓰기 기준으로 나누어서 배열을 반환
   let wordList = msg.split(" ");

   if(!checkValidMsg(wordList, 2, room)){
      return;
   }

   if(!isExist(wordList[1])){
      return;
   }

   removeDataBase(wordList[1]);

   Api.replyRoom(room, wordList[1] + " 삭제 완료.");
}

function checkDB(msg, room) {
   let wordList = msg.split(" ")
   if(!checkValidMsg(wordList, 2, room)){
      return;
   }
   
   if(!isExist(wordList[1])){
      return;
   }

   let returnString = DataBase.getDataBase(wordList[1])

   if(returnString === ""){
      Api.replyRoom(room, "파일이 비어있습니다.")
   }

   Api.replyRoom(room, returnString)
}

function renewDB(msg, room) {
   let wordList = msg.split(" ")
   if(!checkValidMsg(wordList, 3, room)){
      return;
   }

   if(!isExist(wordList[1])){
      return;
   }
   
   DataBase.setDataBase(wordList[1], wordList[2])

   Api.replyRoom(room, "갱신완료.")
}

function removeEndDate(msg, sender, room) {
   let wordList = msg.split(" ")

      if(!checkValidMsg(wordList, 2, room)){
         return;
      }

      const username = getUsername(sender, room);

      if(!username){
         return;
      }

      if(!isExist(username + "_" + wordList[1] + "_date", room)){
         return;
      }

      let dateString = DataBase.getDataBase(username + "_" + wordList[1] + "_date");

      if(dateString === ""){
         Api.replyRoom(room, "날짜 리스트가 비어있습니다!")
         return;
      }

      dateList = getArray(dateString);

      let newDateString = makeDBString(dateList);

      DataBase.setDataBase(username + "_" + wordList[1] + "_date", newDateString)

      Api.replyRoom(username + "님의 " + wordList[1] + " 날짜 리스트 끝값이 삭제되었습니다!")

}  


function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
	const dateReg = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])/

   //!신규유저 김재휘
   if(msg.includes("!신규유저")){
      addUser(msg, sender, room);
   }

   //!생성 다이어리 김재휘
   else if(msg.includes("!생성")){
     makeRoutine(msg, room);
   }

   //debug용
   //!확인데이터 김재휘_다이어리_counter
   else if(msg.includes("!확인데이터")){
      checkDB(msg, room);
   }

   //!갱신데이터 김재휘_다이어리_counter 2
   //2
   else if(msg.includes("!갱신데이터")){
       renewDB(msg, room);
   }

   //!갱신데이터 김재휘_다이어리_counter 2
   //2
   else if(msg.includes("!삭제데이터")){
       deleteDB(msg, room);
   }

   //!삭제끝값 다이어리 김재휘
   else if(msg.includes("!삭제끝값")){
   	removeEndDate(msg, sender, room);
   }

   //!나의루틴 김재휘
   else if(msg.includes("!나의루틴")){
   		let wordList = msg.split(" ")

   		if(wordList.length != 2){
      		replier.reply(room, "올바르지 않은 입력 형식입니다.")
      		return;
      	}

      	let routineString = DataBase.getDataBase(wordList[1] + "_" + "list")
      	let routineList = routineString.split("\n")

      	if(routineList.length == 0){
      		replier.reply(room, "루틴 리스트가 비어있습니다!")
      		return;
      	}

      	replier.reply(routineString)

   }

   //!삭제루틴 다이어리 김재휘
   else if(msg.includes("!삭제루틴")){
   		let wordList = msg.split(" ")

   		if(wordList.length != 3){
      		replier.reply(room, "올바르지 않은 입력 형식입니다.")
      		return;
      	}

      	let routineString = DataBase.getDataBase(wordList[2] + "_" + "list")
      	let routineList = routineString.split("\n")

      	if(routineList.length == 0){
      		replier.reply(room, "루틴 리스트가 비어있습니다!")
      		return;
      	}

      	let routineIdx = routineList.indexOf(wordList[1])

      	if(routineIdx == -1){
      		replier.reply(room, "삭제하고자 하는 루틴이 리스트에 없습니다!")
      		return;
      	}

      	routineList.splice(routineIdx, 1)

      	let newRoutineString = ""

      	routineList.forEach(routine => {
      		if(routine != ""){
      			newRoutineString += routine
      			newRoutineString += "\n"
      		}
      	})

      	DataBase.setDataBase(wordList[2] + "_" + "list", newRoutineString)

      	replier.reply(wordList[2] + "님의 리스트가 갱신되었습니다!")
      	replier.reply(newRoutineString)

   }

   //!삭제유저 김재휘
   else if(msg.includes("!삭제유저")){
         let wordList = msg.split(" ")

         if(wordList.length != 2){
            replier.reply(room, "올바르지 않은 입력 형식입니다.")
            return;
         }

         let userString = DataBase.getDataBase("user_list")
         let userList = userString.split("\n")

         if(userList.length == 0){
            replier.reply(room, "유저 리스트가 비어있습니다!")
            return;
         }

         let userIdx = userList.indexOf(wordList[1])

         if(userIdx == -1){
            replier.reply(room, "삭제하고자 하는 유저가 리스트에 없습니다!")
            return;
         }

         userList.splice(userIdx, 1)

         let newUserString = ""

         userList.forEach(user => {
            if(user != ""){
               newUserString += user
               newUserString += "\n"
            }
         })

         DataBase.setDataBase("user_list", newUserString)

         replier.reply("유저 리스트가 갱신되었습니다!")
         replier.reply(newUserString)

   }

   //!작성완료 2020/03/11 김재휘
   else if(msg.includes("!작성완료")){
      //띄어쓰기 기준으로 나누어서 배열을 반환
      let wordList = msg.split(" ")

      //날짜 형식이 맞는지 확인
      if(!dateReg.test(wordList[1])){
      	replier.reply(room, "잘못된 형식의 날짜 표현입니다.\n yyyy-mm-dd 형식으로 입력해주세요.")
      	return;
      }

      if(wordList.length != 3){
      	replier.reply(room, "올바르지 않은 입력 형식입니다.")
      	return;
      }

      //다이어리에서 counter 정수 불러오기
      let countString = DataBase.getDataBase(wordList[2] + "_다이어리_counter")

      if(countString === null){
         replier.reply(room, "먼저 다이어리를 생성해주세요.")
         return;
      }

      let countList = countString.split("\n")
      let countNum = Number.parseInt(countList[0])
      let contiCountNum = Number.parseInt(countList[1])



      if(countNum == 0){
      	contiCountNum += 1
      } else {
      	let dateString = DataBase.getDataBase(wordList[2] + "_다이어리_date")
      	let dateList = dateString.split("\n")

      	let today = new Date(wordList[1])
      	let lastDay = new Date(dateList[dateList.length-2])

      	lastDay.setDate(lastDay.getDate() + 1)

      	if(today <= lastDay){
      		contiCountNum += 1
      	} else {
      		contiCountNum = 1
      	}
      }

      countNum += 1



      //하나 증가시키고 db에 입력
      DataBase.setDataBase(wordList[2] + "_다이어리_counter", countNum.toString() + "\n" + contiCountNum.toString())

      //날짜 정보 db에 더해주기
      //잘들어가는지 확인을 위해 출력, 이후에는 삭제해도 상관 없음
      DataBase.appendDataBase(wordList[2] + "_다이어리_date", wordList[1] + "\n")

      replier.reply(room, "축하합니다! " + sender + "님.\n" + "총" + countNum.toString() + "번째 다이어리 작성입니다.\n" + "연속 " +contiCountNum.toString()+ "번째입니다.")

      if(contiCountNum == 1){
      	replier.reply("한 번 습관을 시작해보아요~~")
      } else if (contiCountNum == 3){
      	replier.reply("작심삼일을 넘어보자구요~~")
      } else if (contiCountNum == 10){
      	replier.reply("열 번 연속이라니~~~ 칭찬해 칭찬해~~~~")
      } else if (contiCountNum == 100){
      	replier.reply("백 번 돌파~~~ 오마갓 오마갓~~~~")
      } else if (contiCountNum % 100 == 0){
      	replier.reply(contiCountNum.toString() + "번을 달성했어요!!! 다들 칭찬 부탁~~~!!!")
      }
   }

   //!루틴완료 7시기상 2021-12-20 김재휘
   else if(msg.includes("!루틴완료")){
         //띄어쓰기 기준으로 나누어서 배열을 반환
      let wordList = msg.split(" ")

      if(!dateReg.test(wordList[2])){
      	replier.reply(room, "잘못된 형식의 날짜 표현입니다.\n yyyy-mm-dd 형식으로 입력해주세요.")
      	return;
      }

      if(wordList.length != 4){
      	replier.reply(room, "올바르지 않은 입력 형식입니다.")
      	return;
      }

      //다이어리에서 counter 정수 불러오기
      let countString = DataBase.getDataBase(wordList[3] + "_" + wordList[1] +"_counter")

      if(countString === null){
         replier.reply(room, "먼저 " + wordList[1] + "를 생성해주세요.")
         return;
      }

      let countList = countString.split("\n")
      let countNum = Number.parseInt(countList[0])
      let contiCountNum = Number.parseInt(countList[1])


      if(countNum == 0){
      	contiCountNum += 1
      } else {
      	let dateString = DataBase.getDataBase(wordList[3] + "_" + wordList[1] + "_date")
      	let dateList = dateString.split("\n")

      	let today = new Date(wordList[2])
      	let lastDay = new Date(dateList[dateList.length-2])

      	lastDay.setDate(lastDay.getDate() + 1)

      	if(today <= lastDay){
      		contiCountNum += 1
      	} else {
      		contiCountNum = 1
      	}
      }

      countNum += 1

      //하나 증가시키고 db에 입력
      DataBase.setDataBase(wordList[3] + "_" + wordList[1] + "_counter", countNum.toString()+ "\n" + contiCountNum.toString())

      //날짜 정보 db에 더해주기
      //잘들어가는지 확인을 위해 출력, 이후에는 삭제해도 상관 없음
      DataBase.appendDataBase(wordList[3] + "_" + wordList[1] + "_" + "date", wordList[2] + "\n")

      replier.reply(room, "축하합니다! " + sender + "님.\n" + countNum.toString() + "번째 " + wordList[1] +  " 완료입니다.\n" + "연속 " +contiCountNum.toString()+ "번째입니다.")

      if(contiCountNum == 1){
      	replier.reply("한 번 습관을 시작해보아요~~")
      } else if (contiCountNum == 3){
      	replier.reply("작심삼일을 넘어보자구요~~")
      } else if (contiCountNum == 10){
      	replier.reply("열 번 연속이라니~~~ 칭찬해 칭찬해~~~~")
      } else if (contiCountNum == 100){
      	replier.reply("백 번 돌파~~~ 오마갓 오마갓~~~~")
      } else if (contiCountNum % 100 == 0){
      	replier.reply(contiCountNum.toString() + "번을 달성했어요!!! 다들 칭찬 부탁~~~!!!")
      }
   }
   //!현황 김재휘
   else if (msg.includes("!현황")){
   		let wordList = msg.split(" ")
   		if(wordList.length != 2){
   			replier.reply(room, "올바르지 않은 입력 형식입니다.")
      		return;
   		}
   		let routineString = DataBase.getDataBase(wordList[1] + "_" + "list")
   		let routineList = routineString.split("\n")

   		let returnString = ""

   		routineList.forEach(routine => {
   			if(routine != ""){
   				let countString = DataBase.getDataBase(wordList[1] + "_" + routine +"_counter")
   				let countList = countString.split("\n")
   				let countNum = countList[0]
   				let contiCountNum = countList[1]
   				returnString += routine
   				returnString += ": 연속"
   				returnString += contiCountNum
   				returnString += "회, 총 "
   				returnString += countNum
   				returnString += "회\n"
   			}
   		})

   		replier.reply(room, returnString);
   }

   else if (msg == "!오늘"){
   		let today = new Date()

   		let userString = DataBase.getDataBase("user_list")
   		let userList = userString.split("\n")

         let diff = 17
         let koreaTime = new Date()
         koreaTime.setTime(today.getTime() + (17*60*60*1000))

   		let returnString = "미국 시간 :"
         returnString += today.toString();
         returnString += "\n"
         returnString += "한국 시간 :"
         returnString += koreaTime.toString();
         returnString += "\n\n"

   		userList.forEach(user => {
   			if(user != ""){
   				let dateString = DataBase.getDataBase(user + "_다이어리_date")
   				let dateList = dateString.split("\n")
   				let lastDay = new Date(dateList[dateList.length-2])
               lastDay.setDate(lastDay.getDate() + 1)
               if(user == "백지원"){
      				if(lastDay.getDate() == today.getDate() && lastDay.getMonth() == today.getMonth() && lastDay.getYear() == today.getYear()){
      					returnString += user 
      					returnString += "님은 다이어리를 작성하셨습니다~\n\n"
      				} else {
      					returnString += user 
      					returnString += "님 아직 오늘이 남았어요~!! 언능 써버리자구요~\n\n"
      				}
               } else {
                  if(lastDay.getDate() == koreaTime.getDate() && lastDay.getMonth() == koreaTime.getMonth() && lastDay.getYear() == koreaTime.getYear()){
                     returnString += user 
                     returnString += "님은 다이어리를 작성하셨습니다~\n\n"
                  } else {
                     returnString += user 
                     returnString += "님 아직 오늘이 남았어요~!! 언능 써버리자구요~\n\n"
                  }
               }
   			}
   		})
   		replier.reply(room, returnString);
   }

   else if (msg == "!이번달"){
         let today = new Date()

         let userString = DataBase.getDataBase("user_list")
         let userList = userString.split("\n")

         let diff = 17
         let koreaTime = new Date()
         koreaTime.setTime(today.getTime() + (17*60*60*1000))

         let returnString = "미국 시간 :"
         returnString += today.toString();
         returnString += "\n"
         returnString += "한국 시간 :"
         returnString += koreaTime.toString();
         returnString += "\n\n"

         userList.forEach(user => {
            if(user != ""){
               let dateString = DataBase.getDataBase(user + "_다이어리_date")
               let dateList = dateString.split("\n")
               let countNum = 0
               dateList.forEach(lastDayString => {
                     if(lastDayString != ""){
                        let lastDay = new Date(lastDayString)
                        lastDay.setDate(lastDay.getDate() + 1)
                        if(user == "백지원"){
                           if(lastDay.getMonth() == today.getMonth() && lastDay.getYear() == today.getYear()){
                              countNum += 1
                           } else {

                           }
                        } else {
                           if(lastDay.getMonth() == koreaTime.getMonth() && lastDay.getYear() == koreaTime.getYear()){
                              countNum += 1
                           } else {

                           }
                        }
                     }
                  })
                  returnString += "이번 달의 "
                  returnString += user
                  returnString += "님의 총 다이어리 작성 횟수는 "
                  returnString += countNum
                  returnString += "회 입니다.\n"
               }
         })

         replier.reply(room, returnString);
   }

   //!오늘 김재휘
   else if (msg.includes("!오늘")){
   		let wordList = msg.split(" ")

   		if(wordList.length != 2){
   			replier.reply(room, "올바르지 않은 입력 형식입니다.")
      		return;
   		}

   		let today = new Date()

         //17시간 더해주기
         if(wordList[1] != "백지원"){
            let diff = 17
            today.setTime(today.getTime() + (17*60*60*1000))
         }

   		let routineString = DataBase.getDataBase(wordList[1] + "_" + "list")
   		let routineList = routineString.split("\n")

   		let returnString = "유저의 현재 시간 :"
         returnString += today.toString()
         returnString += "\n\n"

   		routineList.forEach(routine => {
   			if(routine != ""){
   				let dateString = DataBase.getDataBase(wordList[1] + "_" + routine +"_date")
   				let dateList = dateString.split("\n")
   				let lastDay = new Date(dateList[dateList.length-2])
               lastDay.setDate(lastDay.getDate() + 1)

             

   				if(lastDay.getDate() == today.getDate() && lastDay.getMonth() == today.getMonth() && lastDay.getYear() == today.getYear()){
   					returnString += routine 
   					returnString += " 오늘 완료~\n"
   				} else {
   					returnString += routine 
   					returnString += " 언능 해버리자구 화팅~\n"
   				}
   				
   			}
   		})

   		replier.reply(room, returnString);
   }


   else if(msg == "!힘내 백지" || msg == "!힘내 백지원" || msg == "!힘내 캘리" || msg == "!힘내 지원"){
         replier.reply(room, "미래인재 일동은 백지를 응원합니다~!~!")
         return;
   }

   else if(msg == "!유노윤호모드" || msg == "!유노윤호"){
         let data = Utils.getWebText("https://chavo-s-it-life.tistory.com/71")
         data = data.replace(/<[^>]+>/g,""); //태그 삭제
         data = data.split("명언시작")[1]
         data = data.split("명언끝")[0]
         data = data.trim()

         awesomeWordList = data.split("\n")

         replier.reply(awesomeWordList[Math.floor(Math.random() * awesomeWordList.length)].trim())
   }

   else if (msg == "!규칙" || msg == "!사용법"){
   		let returnString = ""
         returnString += "0. !신규유저 {본인 이름}\n"
         returnString += "ex) !신규유저 김재휘\n\n"
         returnString += "신규유저가 들어왔을 때 루틴 리스트를 저장하기 위한 용도로 사용됩니다. !신규유저를 안하신 분들은 꼭 해주세요~\n\n"
   		returnString += "1. !생성 {루틴 이름} {본인 이름}\n"
   		returnString += "ex) !생성 다이어리 김재휘\n\n"
   		returnString += "루틴을 추가하기 위한 용도로 사용합니다. 작성완료의 경우 '다이어리'를 default 값을 가지므로 반드시 다이어리는 루틴에 추가해주세요.\n\n"
   		returnString += "2. !작성완료 {날짜} {본인 이름}\n"
   		returnString += "ex) !작성완료 2021-02-23 김재휘\n\n"
   		returnString += "다이어리 작성을 기록하기 위한 용도로 사용합니다. 날짜는 반드시 yyyy-mm-dd 양식으로 만들어주세요.\n\n"
   		returnString += "3. !루틴완료 {루틴 이름} {날짜} {본인 이름}\n"
   		returnString += "ex) !루틴완료 7시아침기상 2021-02-23 김재휘\n\n"
   		returnString += "루틴 완료를 기록하기 위한 용도로 사용합니다. 날짜는 반드시 yyyy-mm-dd 양식으로 만들어주세요.\n\n"
   		returnString += "4. !나의루틴 {본인 이름}\n"
   		returnString += "ex) !나의루틴 김재휘\n\n"
   		returnString += "본인의 루틴 리스트를 확인할 수 있습니다.\n\n"
   		returnString += "5. !삭제루틴 {루틴 이름} {본인 이름}\n"
   		returnString += "ex) !삭제루틴 7시아침기상 김재휘\n\n"
   		returnString += "본인의 루틴 중 하나를 루틴 리스트에서 삭제할 수 있습니다.\n\n"
   		returnString += "6. !삭제끝값 {루틴 이름} {본인 이름}\n"
   		returnString += "ex) !삭제끝값 7시아침기상 김재휘\n\n"
   		returnString += "날짜 입력을 잘못한 경우 해당 루틴의 날짜 끝값을 삭제할 수 있습니다.\n\n"
   		returnString += "7. !현황 {본인 이름}\n"
   		returnString += "ex) !현황 김재휘\n\n"
   		returnString += "나의 루틴의 달성 현황을 확인할 수 있습니다.\n\n"
   		returnString += "8. !오늘 {본인 이름}\n"
   		returnString += "ex) !오늘 김재휘\n\n"
   		returnString += "오늘 나의 루틴의 달성 현황을 확인할 수 있습니다.\n\n"
   		returnString += "9. !오늘\n\n"
   		returnString += "오늘 멤버들의 다이어리 작성 현황을 확인할 수 있습니다.\n\n"
         returnString += "10. !이번달\n\n"
         returnString += "이번달 멤버들의 다이어리 작성 현황을 확인할 수 있습니다.\n\n"
         returnString += "11. !삭제유저 {유저 이름}\n"
         returnString += "ex) !삭제유저 김재휘\n\n"
         returnString += "유저 중 한 명을 루틴 리스트에서 삭제할 수 있습니다.\n\n"

   		replier.reply(room, returnString)
   }
}