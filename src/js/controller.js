///////////////////////////////////////
import * as model from "./model.js";
import { MODAL_CLOSE_SEC } from "./config.js";
import recipeView from "./views/recipeView.js";
import searchView from "./views/searchView.js";
import resultsView from "./views/resultsView.js";
import bookmarksView from "./views/bookmarksView.js";
import addRecipeView from "./views/addRecipeView.js";
import paginationView from "./views/paginationView.js";

import "core-js/stable";
import "regenerator-runtime/runtime";
import { async } from "regenerator-runtime";
///////////////////////////////////////
// HMR (Hot Module Replacement) trong webpack
// hoặc một trình biên dịch JavaScript khác (như babel-loader).
// Đoạn mã này được sử dụng để kiểm tra xem có hỗ trợ HMR không, và nếu có, nó sẽ
// chấp nhận các sự thay đổi trong mã nguồn mà không cần phải làm tải lại trình duyệt.
if (module.hot) {
  module.hot.accept();
}
// if (module.hot): Điều này kiểm tra xem module
// hiện tại có hỗ trợ HMR không. Nếu có, module.hot
// sẽ có giá trị true, và điều kiện này sẽ đúng.

// module.hot.accept(): Đoạn mã này được gọi khi module
// được chấp nhận để chấp nhận các sự thay đổi. Khi bạn thực hiện
// một sự thay đổi trong mã nguồn và lưu lại, HMR sẽ cố gắng áp dụng
// các thay đổi này mà không cần phải tải lại trình duyệt. Khi sự thay đổi
// được chấp nhận, webpack sẽ thay thế module cũ bằng module mới và cập nhật
// giao diện người dùng mà không làm tải lại toàn bộ trang web.
///////////////////////////////////////
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // 0) Update res view to mark selected search res
    resultsView.update(model.getSearchResultsPage());
    // 1) Updating bookmarks view
    // debugger;
    bookmarksView.update(model.state.bookmarks);

    // 2) Loading recipe
    await model.loadRecipe(id);

    // 3) Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    console.log(err);
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    // 1) Get query search
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search results
    await model.loadSearchResult(query);

    // 3) Render results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    // 4) Render initial pagination button
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

// +

const controlPagination = function (goToPage) {
  // 1) Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2) Render NEW pagination button
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update servings
  model.updateServings(newServings);

  // Udapte the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookMark = function () {
  // 1) Add or remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookMark(model.state.recipe);
  else model.deleteBookMark(model.state.recipe.id);

  // 2) Update recipeView when user click btn bookmark
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading Spiner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render Recipe
    recipeView.render(model.state.recipe);

    // Render bookmakr view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, "", `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);

    // Display Succes Message
    addRecipeView.renderMessage();
  } catch (err) {
    console.error("💥", err);
    addRecipeView.renderError(err.message);
  }
};

const newFeature = function () {
  console.log("Welcome to the application");
};
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddMarkBook(controlAddBookMark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView._addHandlerUpload(controlAddRecipe);
  newFeature();
};
init();
