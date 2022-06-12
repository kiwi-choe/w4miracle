const body = document.querySelector("body");
const elGalleryList = document.querySelector(".galleryList");
const form = document.querySelector("#uploadForm");
const elFile = document.querySelector(".uploadForm__file");
const headerLogoSection = document.querySelector("#_header");
const postPhotoLoadingView = document.querySelector(
  ".post_photos_spinner_container"
);
const loadPhotoLoadingView = document.querySelector(
  ".load_photos_spinner_container"
);

// [START] Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCg-XnCKH6zScJY_04rXUf0Fmxbza_JnGU",
  authDomain: "walking4miracle.firebaseapp.com",
  projectId: "walking4miracle",
  storageBucket: "walking4miracle.appspot.com",
  messagingSenderId: "414251762442",
  appId: "1:414251762442:web:242b6a090d8013a7d9f0f3",
  measurementId: "G-X0KSZNYM6V",
};

firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();
const db = firebase.firestore();
db.settings({
  timestampsInSnapshots: true,
});

const COL_PHOTOS = "2022_photos";
// Initialize Firebase [END]

function init() {
  initView();
  selectPhotos().then(() => {
    showLoadPhotoLoadingView(false);
  });
}
init();

function initView() {
  showPostPhotoLoading(false);
  showLoadPhotoLoadingView(true);
}

function onClickHeaderLogo() {
  window.location.href = "../index.html";
}
headerLogoSection.addEventListener("click", onClickHeaderLogo);

async function onSubmit(event) {
  event.preventDefault();

  const photo = document.querySelector(".uploadForm__file").files[0];

  // try {
  clearSelectedFile();

  if (!validatePhoto(photo)) {
    return;
  }

  showPostPhotoLoading(true);

  const response = await savePhotoToStorage(photo);
  const photoUrl = await getPhotoURL(response);
  const posting = convertToPosting(photoUrl);

  await savePhotoToDB(posting);
  showPostPhotoLoading(false);

  prependGallery(posting);
  // } catch (e) {
  //   throw e;
  // }
}
// submit
form.addEventListener("submit", onSubmit);

function showPostPhotoLoading(visible) {
  if (visible) {
    postPhotoLoadingView.style.setProperty("display", "flex");
  } else {
    postPhotoLoadingView.style.setProperty("display", "none");
  }
}

function showLoadPhotoLoadingView(visible) {
  if (visible) {
    loadPhotoLoadingView.style.setProperty("display", "flex");
  } else {
    loadPhotoLoadingView.style.setProperty("display", "none");
  }
}

async function selectPhotos() {
  let photos;
  // if (isPhotosInLocalStorage()) {
  //   photos = getPhotosFromLocalStorage();
  // } else {
  photos = await getPhotosFromDB(); // 조회
  //   addToLocalStorage(photos);
  // }
  showPhotos(photos);
}

function getPhotosFromLocalStorage() {
  return JSON.parse(localStorage.getItem("photos"));
}

function isPhotosInLocalStorage() {
  return localStorage.getItem("photos");
}

function addToLocalStorage(photos) {
  localStorage.setItem("photos", JSON.stringify(photos));
}

async function getPhotosFromDB() {
  console.log("db 조회");
  const photos = await db
    .collection(COL_PHOTOS)
    .orderBy("createdAt", "asc")
    .get()
    .then((snapshot) => {
      return snapshot.docs.map((doc) => doc.data());
    });
  return photos;
}

function showPhotos(photos) {
  if (photos.length !== 0) {
    photos.map((photo) => {
      prependGallery(photo);
    });
  }
}

function validatePhoto(theFile) {
  if (!theFile) {
    alert("사진을 선택해주세요.");
    return false;
  }
  return true;
}

async function getPhotoURL(response) {
  const fileURL = await response.ref.getDownloadURL(); // 파일 url 가져오기
  return fileURL;
}

async function savePhotoToStorage(photo) {
  const today = new Date().toISOString();
  const storageRef = storage.ref();
  const path = storageRef.child(`2022_image/${today}`);
  const response = await path.put(photo); // storage에 저장
  return response;
}

function convertToPosting(fileURL) {
  const today = new Date().toISOString();
  return {
    createdAt: today,
    fileURL: fileURL,
  };
}

async function savePhotoToDB(post) {
  await db.collection(COL_PHOTOS).add(post);
}

function clearSelectedFile() {
  elFile.value = "";
}

function prependGallery(posting) {
  const elDiv = document.createElement("div");
  const elImg = document.createElement("img");

  elImg.setAttribute("src", posting.fileURL);
  elDiv.setAttribute("class", "item");
  elDiv.append(elImg);
  elGalleryList.prepend(elDiv);
}
