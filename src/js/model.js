///////////////////////////////////////
import { async } from "regenerator-runtime";
import { API_URL, KEY, RES_PER_PAGE } from "./config.js";
// import { getJSON, sendJSON } from "./helpers.js";
import { AJAX } from "./helpers.js";
///////////////////////////////////////
export const state = {
  recipe: {},
  search: {
    query: "",
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data; //const recipe = data.data.recipe
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredints: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async (id) => {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some((bookmark) => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    throw err;
  }
};

export const loadSearchResult = async function (query) {
  try {
    state.search.query = query;

    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`); //Truy vấn tìm kiếm

    state.search.results = data.data.recipes.map((rec) => {
      return {
        id: rec.id,
        image: rec.image_url,
        publisher: rec.publisher,
        title: rec.title,
        ...(rec.key && { key: rec.key }),
      };
    });

    state.search.page = 1;
  } catch (err) {
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredints.forEach((ing) => {
    //newQt = oldQt * newServings / oldServings // 2 * 8/4 = 2
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });
  state.recipe.servings = newServings;
};

const persistBookmarks = function () {
  localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks));
};

export const addBookMark = function (recipe) {
  // Add bookmark
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmarked
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
  persistBookmarks();
};

export const deleteBookMark = function (id) {
  const index = state.bookmarks.findIndex((el) => el.id === id);
  state.bookmarks.splice(index, 1);

  // Mark curent recipe as NOT bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;
  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem("bookmarks");
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

const clearBookmarks = function () {
  localStorage.clear("bookmarks");
};
// clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter((entry) => {
        return entry[0].startsWith("ingredient") && entry[1] !== "";
      })
      .map((ing) => {
        const ingArr = ing[1].split(",").map((el) => el.trim());
        // const ingArr = ing[1].replaceAll(" ", "").split(",");
        if (ingArr.length !== 3)
          throw new Error(
            "Wrong ingredient fromat, Please use the correct format"
          );

        const [quantity, unit, description] = ingArr;

        return {
          quantity: quantity ? +quantity : null,
          unit,
          description,
        };
      });

    // final data submit, ready to send the API
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      publisher: newRecipe.publisher,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    // Refactor data submit same with the main recipe, for good format !
    state.recipe = createRecipeObject(data);

    // Adding bookmared for the new addRecipe
    addBookMark(state.recipe);
  } catch (err) {
    throw err;
  }
};
// key'cea154e0-1a9e-4340-8341-624fc3bd7a04'
