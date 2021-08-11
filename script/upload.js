const body = document.querySelector("body");
const elGalleryList = document.querySelector(".galleryList");
const form = document.querySelector("#uploadForm");
const elFile = document.querySelector(".uploadForm__file");
const headerLogoSection = document.querySelector("#_header");

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

const COL_PHOTOS = "photos";
// Initialize Firebase [END]

function init() {
  selectPhotos();
}
init();

function onClickHeaderLogo() {
  window.location.href = "../index.html";
}
headerLogoSection.addEventListener("click", onClickHeaderLogo);

// submit
form.addEventListener("submit", onSubmit);

async function onSubmit(event) {
  event.preventDefault();
  const photo = document.querySelector(".uploadForm__file").files[0];

  try {
    initView();

    if (!validatePhoto(photo)) return;

    const photoUrl = await getFileURL(photo);
    const posting = getPosting(photoUrl);

    addPhoto(posting);
    prependGallery(posting);
  } catch (e) {
    throw e;
  }
}

async function selectPhotos() {
  const photos = await getPhotos();
  viewPhotos(photos);
}

async function getPhotos() {
  const photos = await db
    .collection(COL_PHOTOS)
    .orderBy("createdAt", "asc")
    .get()
    .then((snapshot) => {
      return snapshot.docs.map((doc) => doc.data());
    });
  return photos;
}

function viewPhotos(photos) {
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

async function getFileURL(theFile) {
  const today = new Date().toISOString();
  const storageRef = storage.ref();
  const path = storageRef.child(`image/${today}`);
  const response = await path.put(theFile);
  const fileURL = await response.ref.getDownloadURL();
  return fileURL;
}

function getPosting(fileURL) {
  const today = new Date().toISOString();
  return {
    createdAt: today,
    fileURL: fileURL,
  };
}

function addPhoto(post) {
  db.collection(COL_PHOTOS).add(post);
}

function initView() {
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
