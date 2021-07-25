const walkCountInputForm = document.getElementById("walkcount-form")
const username = walkCountInputForm.querySelector("#username")
const phoneNumber = walkCountInputForm.querySelector("#phomenumber")
const walkcount = walkCountInputForm.querySelector("#walkcount")

const completedMsg = document.getElementById("completed-msg")

function onSubmit(info) {
    info.preventDefault();
    // console.log(info);

    if(validateInputData(username.value, phoneNumber.value, walkcount.value)) {
        // alert("제출하시겠습니까?")
        console.log(username.value, phoneNumber.value, walkcount.value)
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
