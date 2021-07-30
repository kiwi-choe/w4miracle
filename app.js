const walkCountInputForm = document.getElementById("walkcount-form")
const username = walkCountInputForm.querySelector("#username")
const phoneNumber = walkCountInputForm.querySelector("#phomenumber")
const walkcount = walkCountInputForm.querySelector("#walkcount")

// total walk count
const totalWalkCnt = document.querySelector("#totalWalkCnt")

const completedMsg = document.getElementById("completed-msg")

// firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCg-XnCKH6zScJY_04rXUf0Fmxbza_JnGU",
    authDomain: "walking4miracle.firebaseapp.com",
    projectId: "walking4miracle",
    storageBucket: "walking4miracle.appspot.com",
    messagingSenderId: "414251762442",
    appId: "1:414251762442:web:242b6a090d8013a7d9f0f3",
    measurementId: "G-X0KSZNYM6V"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
db.settings({ timestampsInSnapshots: true });

// 총 걸음수 조회
db
    .collection('totalWalkCnt')
    .get()
    .then(snapshot => {
        snapshot.docs.forEach(doc => {
            if (doc.data().totalWalkCnt > 0) {
                totalWalkCnt.textContent = doc.data().totalWalkCnt;
            } else {
                totalWalkCnt.textContent = 0
            }
        })
    })

async function onSubmit(info) {
    info.preventDefault();
    // console.log(info);

    if(validateInputData(username.value, phoneNumber.value, walkcount.value)) {
        const today = new Date();
        // alert("제출하시겠습니까?")
        console.log(username.value, phoneNumber.value, walkcount.value)

        try {
            // user collection
            await db
                .collection('users')
                .add({
                    username: username.value,
                    phoneNumber: phoneNumber.value,
                    walkcount: walkcount.value,
                    createdAt: today.toISOString()
                });
            
            // totalWalkCount collection
            await db
                .collection('totalWalkCnt')
                .doc('Krn2yRKgaTh9sALsvRhH')
                .update({
                    totalWalkCnt: Number(totalWalkCnt.textContent) + Number(walkcount.value)
                })
        } catch (e) {
            
        }

        hideInputForm()
        showCompletedMsg(username.value, walkcount.value)
    } else {
        alert("이름, 번호, 걸음수 입력해주세요!")
    }
}

walkCountInputForm.addEventListener("submit", onSubmit)

function showCompletedMsg(username, walkcount) {
    completedMsg.innerText = `${username} ${walkcount}걸음 입력 완료!`
    completedMsg.classList.remove("hidden")
}

function hideInputForm() {
     // walkCountInputForm.classList.add("hidden")
    walkCountInputForm.style.setProperty("display", "none")
}

function validateInputData(username, phoneNumber, walkcount) {
    return (username !== "" && 
    phoneNumber !== "" && 
    walkcount !== "")
}
