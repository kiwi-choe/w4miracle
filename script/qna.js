const question = document.querySelector("#question");
const answer = document.querySelector(".answer");
const QNA_JSON_PATH = "../json/qna.json";

/*
    qna 데이터 불러오기
*/
const getQnaJson = async () => {
  return fetch(QNA_JSON_PATH)
    .then((res) => res.json())
    .catch((err) => console.error(err));
};

/*
    질문 셋팅
*/
const setQuestion = (qstn) => {
  question.textContent = qstn;
};

/*
    대답 셋팅
*/
const setAnswer = (answrArr) => {
  answrArr.forEach((answr) => {
    const liAnswr = document.createElement("li");

    liAnswr.setAttribute("class", "answerEl");
    liAnswr.textContent = answr.text;

    answer.append(liAnswr);
  });
};

/*
    qna 데이터 셋팅
*/
const setQna = async () => {
  const qnaJson = await getQnaJson();
  const {
    q1: { qstn, answrArr },
  } = qnaJson;

  setQuestion(qstn);
  setAnswer(answrArr);
};

/*
    init
*/
const init = async () => {
  await setQna();
};

init();
