# Nodejs 동작방식 설명  
### 1. bin폴더 내의 [www.js](https://github.com/SausageMania/PDF-Note-with-voice-recognition/blob/master/bin/www) 에서 http 웹 서버를 생성함.
>Port번호는 [8000번](https://github.com/SausageMania/PDF-Note-with-voice-recognition/blob/master/bin/www#L15) 으로 지정했음.
-------    
### 2. app.js에서 웹 연결을 설정함.
>첫화면으로 routes/index.js를 실행함. 
(참고 : [app.js line7](https://github.com/SausageMania/PDF-Note-with-voice-recognition/blob/master/app.js#L7), [app.js line25](https://github.com/SausageMania/PDF-Note-with-voice-recognition/blob/master/app.js#L25))  
이러한 방식으로 app.use()함수를 사용하여 웹을 서버에 등록할 수 있음.
-------   
### 3. routes/[index.js](https://github.com/SausageMania/PDF-Note-with-voice-recognition/blob/master/routes/index.js)를 처음으로 실행시킴.
>[routes.get](https://github.com/SausageMania/PDF-Note-with-voice-recognition/blob/master/routes/index.js#L7) 함수를 실행시켜 views/[index.ejs](https://github.com/SausageMania/PDF-Note-with-voice-recognition/blob/master/views/index.ejs)로 이동함.
-------   
### 4. index.ejs에서 form method="POST" 방식으로 routes/index.js 내의 [post](https://github.com/SausageMania/PDF-Note-with-voice-recognition/blob/master/routes/index.js#L11) 함수를 실행시킴.
> 해당 함수 내의 mdf()함수가 있는데 이는 [index.js line4](https://github.com/SausageMania/PDF-Note-with-voice-recognition/blob/master/routes/index.js#L4) 에 정의하였으며  
정의된 mdf() 함수는 routes/[modify.js line6](https://github.com/SausageMania/PDF-Note-with-voice-recognition/blob/master/routes/modify.js#L6) 에 위치함.
------- 
### 5. modify함수를 실행시켜 test.pdf 파일을 생성함. ([참고](https://github.com/SausageMania/PDF-Note-with-voice-recognition/blob/master/routes/modify.js#L31))
>현재 생성이 1.5~2초가 걸리는 딜레이 문제가 있으며 추후에 해결방안을 고민해봐야함.
<br/>

## 번외 - POST방식과 EJS 연결
### 1. localhost:8000/post_page 로 접속하면 ID와 비밀번호를 입력하는 칸이 나옴.
>이는 [app.js line28](https://github.com/SausageMania/PDF-Note-with-voice-recognition/blob/master/app.js#L28) 구문으로 등록되어 있으며 [routes/post_page.js](https://github.com/SausageMania/PDF-Note-with-voice-recognition/blob/master/routes/post_page.js)와 연결됨.  
------- 
### 2. post_page.js의 [get](https://github.com/SausageMania/PDF-Note-with-voice-recognition/blob/master/routes/post_page.js#L5) 함수 실행으로 views/[post_page.ejs](https://github.com/SausageMania/PDF-Note-with-voice-recognition/blob/master/views/post_page.ejs)로 이동함.
>post_page.ejs 내의 [form action="/result_page" method="post"](https://github.com/SausageMania/PDF-Note-with-voice-recognition/blob/master/views/post_page.ejs#L13) 방식으로 routes/[result_page.js](https://github.com/SausageMania/PDF-Note-with-voice-recognition/blob/master/routes/result_page.js) 를 실행시킴.  
이 구문에서 action="/result_page" 가 result_page.js로의 연결을 의미하며  
method="post"가 POST 함수를 실행시킬 것을 의미함.
------- 
### 3. result_page.js에서 POST함수를 실행시켜 입력한 id와 pwd를 불러오고 이 변수값을 views/[result_page.ejs](https://github.com/SausageMania/PDF-Note-with-voice-recognition/blob/master/views/result_page.ejs)에 보냄.
>불러온 값과 보내는 방법은 각각 result_page.js의 [line6](https://github.com/SausageMania/PDF-Note-with-voice-recognition/blob/master/routes/result_page.js#L6)과 [line11](https://github.com/SausageMania/PDF-Note-with-voice-recognition/blob/master/routes/result_page.js#L11)을 참고할 것.
------- 
### 4. result_page.ejs에서 불러온 id와 pwd 값을 띄워줌.
>EJS 구문은 <%= %>로 이루어짐을 알아둘 것.
------- 
