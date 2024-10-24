"use strict";

// Sélection des éléments du DOM
document.addEventListener("DOMContentLoaded", () => {
  const containerMovies = document.querySelector(".container-movies");
  const btnSeeMore = document.querySelector(".btn-seemore");
  const searchBtn = document.querySelector(".search-btn");
  const searchInput = document.querySelector(".search-input");
  const btnNowPlaying = document.querySelector(".btn-newmovie");

  const keyApi = "cc21ebb0db4ce9af88a32340aab320b7";
  let currentPage = 1;
  let totalPages = 1;
  let moviesCache = [];

  async function getMovies(page = 1) {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${keyApi}&page=${page}`
      );
      console.log("Response status:", response.status);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Data received:", data);
      totalPages = data.total_pages;

      moviesCache.push(...data.results);
      displayMovies();

      if (currentPage >= totalPages) {
        btnSeeMore.style.display = "none";
      }
    } catch (error) {
      console.error("Fetch error: ", error);
    }
  }

  async function getMoviesNowPlaying(page = 1) {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/now_playing?api_key=${keyApi}&page=${page}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      totalPages = data.total_pages;
      moviesCache.push(...data.results);
      displayMovies();

      if (currentPage >= totalPages) {
        btnSeeMore.style.display = "none";
      }
    } catch (error) {
      console.error("Fetch error: ", error);
    }
  }

  function displayMovies() {
    let html = "";
    const moviesToDisplay = moviesCache.slice(
      (currentPage - 1) * 10,
      currentPage * 10
    );

    moviesToDisplay.forEach((movie) => {
      const imageUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
      html += `
        <div class="movie-card" data-id="${movie.id}">
          <img src="${imageUrl}" alt="${movie.title}">
        </div>
      `;
    });

    containerMovies.insertAdjacentHTML("beforeend", html);

    document.querySelectorAll(".movie-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        const movieId = e.currentTarget.getAttribute("data-id");
        window.location.href = `movie.html?id=${movieId}`;
      });
    });
  }

  btnSeeMore.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      getMovies(currentPage);
    } else {
      btnSeeMore.style.display = "none";
    }
  });

  btnNowPlaying.addEventListener("click", () => {
    moviesCache = []; // Réinitialiser le cache des films
    currentPage = 1;
    containerMovies.innerHTML = ""; // Vide le conteneur avant d'afficher les résultats
    getMoviesNowPlaying(); // Charger les films maintenant à l'affiche
  });

  async function searchMovieByTitle() {
    const searchMovie = searchInput.value.trim();

    if (!searchMovie) {
      alert("Please enter the title of the movie.");
      return;
    }

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${keyApi}&query=${searchMovie}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      moviesCache = data.results;
      currentPage = 1;
      containerMovies.innerHTML = ""; // Vide le conteneur avant d'afficher les résultats
      displaySearchResults();
    } catch (error) {
      console.error("Fetch error: ", error);
    }
  }

  function displaySearchResults() {
    let html = "";

    if (moviesCache.length === 0) {
      html = "<p>No movies found.</p>";
    } else {
      moviesCache.forEach((movie) => {
        const imageUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        html += `
          <div class="movie-card" data-id="${movie.id}">
            <img src="${imageUrl}" alt="${movie.title}">
          </div>
        `;
      });
    }

    containerMovies.insertAdjacentHTML("beforeend", html);

    document.querySelectorAll(".movie-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        const movieId = e.currentTarget.getAttribute("data-id");
        window.location.href = `movie.html?id=${movieId}`;
      });
    });
  }

  searchBtn.addEventListener("click", searchMovieByTitle);
  searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      searchMovieByTitle();
    }
  });

  // Chargement initial des films populaires
  getMovies();
});
