'use strict';
import { filmsApi } from './apiMainPage';
// import { divEl } from './filmCard';
import localStorageService from '../localstorage.js';
import { Notify } from 'notiflix';

const body = document.querySelector('body');
const modalBackdrop = document.querySelector('.backdrop__modal-film');
const buttonCloseModal = document.querySelector('button[data-modal-close]');
const modalFilmInfo = document.querySelector('.modal-film__info-card');
// const addToWatchedBtn = document.querySelector('button[data-modal-watched]');
// const addToQueueBtn = document.querySelector('button[data-modal-queue]');
const { save } = localStorageService;

body.addEventListener('click', onOpenModalFilmInfo);
function onOpenModalFilmInfo(event) {
    
    // console.log(event.target);
    if (!event.target.closest("[data-id]")) {
        return;
    }

    // console.log(event.target.parentNode);

    const currentFilmId = event.target.parentNode.dataset.id;
    
    addFilmInfo(currentFilmId);

    modalBackdrop.classList.remove('is-hidden');
    body.classList.add('no-scroll');

    window.addEventListener('click', onCloseModalbyBackdrop);
    window.addEventListener('keydown', onKeyClick);
    buttonCloseModal.addEventListener('click', onCloseModalbyCross);

    // addToWatchedBtn.addEventListener('click', onAddToWatchedToLocalStorage);
    // addToQueueBtn.addEventListener('click', onAddToQueueToLocalStorage);
    modalFilmInfo.addEventListener('click', onAddToWatchedToLocalStorage);
    modalFilmInfo.addEventListener('click', onAddToQueueToLocalStorage);
}

function onCloseModalbyCross() {
    modalSettings();
    // console.log(event.target);
}

function onKeyClick(event){
    if (event.code !== 'Escape') {
        return;
    };
    modalSettings();
    
}

function onCloseModalbyBackdrop(event) {
    if (event.target === modalBackdrop) {
        modalSettings();
    }
}

function modalSettings() {
    modalBackdrop.classList.add('is-hidden');
    body.classList.remove('no-scroll');
    clearBackdropListeners();
    modalFilmInfo.innerHTML = "";
}

function clearBackdropListeners() {
    window.removeEventListener('keydown', onKeyClick);
    window.removeEventListener('click', onCloseModalbyBackdrop);
    buttonCloseModal.removeEventListener('click', onCloseModalbyCross);
}

let dataObj = null;

function addFilmInfo(filmId) {
    // console.log(filmId);
    return filmsApi.getInfoByOneFilm(filmId)
        .then(({ data }) => {
            dataObj = data;
            // console.log(dataObj);
            // modalFilmInfo.innerHTML = createFilmCard(data);
            modalFilmInfo.insertAdjacentHTML('afterbegin', createFilmCard(data));
        })
        .catch(error => {
            console.log(error);
        });
};

//create film card
function createFilmCard(obj) {
    const { title, vote_average, vote_count, popularity, original_title, overview, genres, poster_path } = obj;
    const genresArr = [];
    genres.map(el => genresArr.push(el.name));
    // console.log(genres);
    // console.log(genresArr.join(", "));
    return `
            <div class="film-card__picture-container">
                <img class="film-card__picture" src="https://image.tmdb.org/t/p/w300${poster_path}" alt="${title}">
            </div>
            <div class="film-card__about-film-container">
                <div class="film-card__about-film-block">
                    <h2 class="film-card__title">${title}</h2>
                    <ul class="film-card__info-list">
                        <li class="film-card__info-el">
                            <p class="film-card__info-item">Vote / Votes</p>
                            <p class="film-card__info-item--value">
                                    <span class="info-item__highlight-orange">${vote_average.toFixed(1)}</span> / 
                                    <span class="info-item__highlight-grey">${vote_count.toFixed()}</span>
                            </p>
                        </li>
                        <li class="film-card__info-el">
                            <p class="film-card__info-item">Popularity</p>
                            <p class="film-card__info-item--value">${popularity.toFixed(1)}</p>
                        </li>
                        <li class="film-card__info-el">
                            <p class="film-card__info-item">Original Title</p>
                            <p class="film-card__info-item--value">${original_title.toUpperCase()}</p>
                        </li>
                        <li class="film-card__info-el">
                        <p class="film-card__info-item">Genre</p>
                        <p class="film-card__info-item--value">${genresArr.join(", ")}</p>
                        </li>
                    </ul>
                    <p class="film-card__overview-about">About</p>
                    <p class="film-card__overview">${overview}</p>
                </div>

                <div class="modal-film__buttons-block">
                    <button type="submit" class="modal-film__btn-watched" data-modal-watched>Add to watched</button>
                    <button type="submit" class="modal-film__btn-queue" data-modal-queue>Add to queue</button>
                </div>

            </div>
    `
};

//add to local storage to watched
let userWatchedList = [];
if (localStorage.getItem('user-watched-list')) {
    try {
        userWatchedList = JSON.parse(localStorage.getItem('user-watched-list'));
        // console.log(userWatchedList);
    }
    catch (error) {
        console.log(error);
    }
};

function onAddToWatchedToLocalStorage(event) {
    event.preventDefault();
    // const userWatchedList = dataObj;
    
    if (!event.target.closest("[data-modal-watched]")) {
        return;
    }
    
    let userWatchedFilm = {
        id: dataObj.id,
        title: dataObj.title,
        vote_average: dataObj.vote_average,
        genres: dataObj.genres,
        poster_path: dataObj.poster_path,
        release_date: dataObj.release_date,
    };
    
    if (userWatchedList.every(el => el.id !== dataObj.id)) {
        // console.log(userWatchedList.every(el => el.id === dataObj.id));
        userWatchedList.push(userWatchedFilm);
        save("user-watched-list", userWatchedList);
        // localStorage.setItem("user-watched-list", JSON.stringify(userWatchedList));
    } else {
        // alert('This film have already add to watched list');
        Notify.failure('This film have already add to watched list');
    }
    // console.log(userWatchedList);
    // console.log(JSON.stringify(userWatchedList));
}

// //add to local storage to queue
let userQueueList = [];
if (localStorage.getItem('user-queue-list')) {
    try {
        userQueueList = JSON.parse(localStorage.getItem('user-queue-list'));
        // console.log(userQueueList);
    }
    catch (error) {
        console.log(error)
    }
};

function onAddToQueueToLocalStorage(event) {
    event.preventDefault();
    // const userQueueList = dataObj;
    if (!event.target.closest("[data-modal-queue]")) {
        return;
    }
    
    let userQueueFilm = {
        id: dataObj.id,
        title: dataObj.title,
        vote_average: dataObj.vote_average,
        genres: dataObj.genres,
        poster_path: dataObj.poster_path,
        release_date: dataObj.release_date,
    };

    if (userQueueList.every(el => el.id !== dataObj.id)) {
        // console.log(userQueueList.every(el => el.id === dataObj.id));
        userQueueList.push(userQueueFilm);
        save("user-queue-list", userQueueList);
        // localStorage.setItem("user-queue-list", JSON.stringify(userQueueList));
    } else {
        // alert('This film have already add to queue list');
        Notify.failure('This film have already add to queue list');
    }
    
    // console.log(userQueueList);
    // console.log(JSON.stringify(userQueueList));
}
