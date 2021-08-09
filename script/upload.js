const body = document.querySelector('body');
const elGalleryList = document.querySelector('.galleryList');
const form = document.querySelector('#uploadForm');
const elFile = document.querySelector('.uploadForm__file');
const elMessage = document.querySelector('.uploadForm__text');
const elPrevImgWrap = document.querySelector('.prevImgWrap');

// Initialize Firebase
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

const COL_PHOTOS = 'photos';

function init() {
	selectPhotos();
}
init();

// preview
elFile.addEventListener('change', (event) => {
	event.preventDefault();
	const {
		target: {
			files
		}
	} = event;
	const theFile = files[0];
	const reader = new FileReader();
	elPrevImgWrap.textContent = '';

	reader.onloadend = (finishedEvent) => {
		const {
			currentTarget: {
				result
			}
		} = finishedEvent;
		let previewImg = document.createElement('img');

		previewImg.style.width = '100px';
		previewImg.style.height = '100px';
		previewImg.setAttribute('src', result);
		elPrevImgWrap.appendChild(previewImg)
	}
	reader.readAsDataURL(theFile);
})

// submit
form.addEventListener('submit', onSubmit)

async function onSubmit(event) {
	event.preventDefault();
	const theFile = document.querySelector('.uploadForm__file').files[0];

	try {
		if (!validCheck(theFile, elMessage.value)) return;

		const fileURL = await getFileURL(theFile);
		const posting = getPosting(fileURL, elMessage.value);

		addPhotos(posting);
		initView();
		prependGallery(posting);

	} catch (e) {
		throw e;
	}
}

async function selectPhotos() {
	const photos = await getPhotos();
	viewPhotos(photos)
}

async function getPhotos() {
	const photos = await db
		.collection(COL_PHOTOS)
		.orderBy("createdAt", "desc")
		.get()
		.then(snapshot => {
			return snapshot.docs.map((doc) => doc.data());
		})
	return photos;
}

function viewPhotos(photos) {
	if (photos.length !== 0) {
		photos.map(gallery => {
			const elLi = document.createElement('li');
			const elImg = document.createElement('img');
			const elSpan = document.createElement('span');

			elImg.setAttribute('src', gallery.fileURL);
			elImg.style.width = '100px';
			elImg.style.height = '100px';
			elSpan.textContent = gallery.message;

			elLi.append(elImg, elSpan);
			elGalleryList.appendChild(elLi)
		})
	}
}

function validCheck(theFile, message) {
	if (!theFile) {
		alert('사진을 선택해주세요.')
		return false;
	}
	if (!message) {
		alert('응원메시지를 남겨주세요!')
		return false;
	}
	return true
}

async function getFileURL(theFile) {
	const today = new Date().toISOString();
	const storageRef = storage.ref();
	const path = storageRef.child(`image/${today}`);
	const response = await path.put(theFile);
	const fileURL = await response.ref.getDownloadURL();
	return fileURL;
}

function getPosting(fileURL, message) {
	const today = new Date().toISOString();
	return {
		createdAt: today,
		fileURL: fileURL,
		message: message
	}
}

async function addPhotos(post) {
	await db
		.collection(COL_PHOTOS)
		.add(post)
}

function initView() {
	elMessage.value = '';
	elPrevImgWrap.textContent = '';
}

function prependGallery(posting) {
	const elLi = document.createElement('li');
	const elImg = document.createElement('img');
	const elSpan = document.createElement('span');

	elImg.setAttribute('src', posting.fileURL);
	elImg.style.width = '100px';
	elImg.style.height = '100px';
	elSpan.textContent = posting.message;

	elLi.append(elImg, elSpan);
	elGalleryList.prepend(elLi)
}