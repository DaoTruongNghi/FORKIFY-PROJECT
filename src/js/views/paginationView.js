import { _ } from "core-js";
import View from "./View.js";
import icons from "url:../../img/icons.svg";

class PaginationView extends View {
  _parentElement = document.querySelector(".pagination");

  addHandlerClick(handler) {
    this._parentElement.addEventListener("click", function (e) {
      const btn = e.target.closest(".btn--inline");
      if (!btn) return;

      const goToPage = +btn.dataset.goto;

      handler(goToPage);
    });
  }

  _generateMarkup() {
    const curPage = this._data.page;
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );
    const createButton = (page, type) =>
      this._generateMarkupButton(page, type, curPage);
    console.log(numPages);

    // Page 1 and there are other pages
    if (curPage === 1 && numPages > 1) {
      return createButton(curPage + 1, "next");

      // return `
      //   <button class="btn--inline pagination__btn--next">
      //       <span>Page ${curPage + 1}</span>
      //       <svg class="search__icon">
      //         <use href="${icons}#icon-arrow-right"></use>
      //       </svg>
      //   </button>
      // `;
    }
    // Last Page
    if (curPage === numPages && numPages > 1) {
      return createButton(curPage - 1, "prev");

      // return `
      //   <button class="btn--inline pagination__btn--prev">
      //       <svg class="search__icon">
      //         <use href="${icons}#icon-arrow-left"></use>
      //       </svg>
      //       <span>Page ${curPage - 1}</span>
      //   </button>
      // `;
    }
    // Other Pages
    if (curPage < numPages) {
      const prevButton = createButton(curPage - 1, "prev");
      const nextButton = createButton(curPage + 1, "next");
      return `${prevButton} ${nextButton}`;

      // return `
      //   <button class="btn--inline pagination__btn--prev">
      //       <svg class="search__icon">
      //         <use href="${icons}#icon-arrow-left"></use>
      //       </svg>
      //       <span>Page ${curPage - 1}</span>
      //   </button>
      //   <button class="btn--inline pagination__btn--next">
      //       <span>Page ${curPage + 1}</span>
      //       <svg class="search__icon">
      //         <use href="${icons}#icon-arrow-right"></use>
      //       </svg>
      //   </button>
      // `;
    }
    // Page 1 and there are NOT other pages
    return "";
  }

  _generateMarkupButton(page, type, curPage) {
    const dataGoTo =
      type === "prev" ? curPage - 1 : type === "next" ? curPage + 1 : "";

    return `
      <button data-goto=${dataGoTo} class="btn--inline pagination__btn--${type}">
            ${
              type === "prev"
                ? `<svg class="search__icon">
              <use href="${icons}#icon-arrow-left"></use>
            </svg>`
                : " "
            }
            <span>Page ${page}</span>
            ${
              type === "next"
                ? `<svg class="search__icon">
              <use href="${icons}#icon-arrow-right"></use>
            </svg>`
                : " "
            }
      </button>
    `;
  }
}

export default new PaginationView();
