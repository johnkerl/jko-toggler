'use strict';

/**
 * Simple support for expandable/collapsible sections within HTML files.
 * To do: module.exports.
 *
 * John Kerl, 2020
 * https://github.com/johnkerl/jko-toggler/blob/master/README.md
 */
class JKOToggler {
  // ----------------------------------------------------------------
  // PUBLIC METHODS

  /**
   * toggleableDivPrefix: Your naming convention for the prefix of all the
   * expandable divs in your HTML which you want this class to manage.
   * Example: Your prefix is 'toggleable_'. Have divs with IDs 'toggleable_1'
   * and 'toggleable_2'. In your HTML, have buttons with IDs
   * 'toggleable_1_button' and 'toggleable_2_button'.
   *
   * buttonSelectStyle: style updates for selected buttons.
   *
   * buttonDeselectStyle: style updates for deselected buttons.
   *
   * urlShorthands: an object mapping short names like 'foo' to full div names
   * like 'toggleable_div_foo'. Then users can access 'index.html?foo'
   * to get a link to the page with div id 'toggleable_div_foo' expanded.
   */
  constructor(toggleableDivPrefix, buttonSelectStyle, buttonDeselectStyle, urlShorthands) {
    this._allDivNames = [];
    const divs = document.querySelectorAll('div');
    for (let div of divs) {
      const id = div.id;
      if (id.startsWith(toggleableDivPrefix)) {
        this._allDivNames.push(id);
      }
    }

    this._buttonSelectStyle = buttonSelectStyle;
    this._buttonDeselectStyle = buttonDeselectStyle;
    this._allExpanded = false;
    // Include the prefix in case there are multiple togglers on the same page.
    this.LOCAL_STORAGE_KEY = document.URL + '-toggler-memory-' + toggleableDivPrefix;

    // Find out what to expand/collapse:
    // * If specified in the URL, use that
    //   Example:
    //   o urlShorthands = {'about': 'toggleable_div_about'}
    //   o URL = https://nameofsite.org/nameofpage?about
    //   o Then expand the 'toggleable_div_about' div
    // * Else retrieve last-used from browser local storage
    const urlParams = new URLSearchParams(window.location.search);

    let foundAny = false;

    Object.keys(urlShorthands).forEach(urlShorthand => {
      if (urlParams.get(urlShorthand) != null) {
        this.collapseAll();
        const divName = urlShorthands[urlShorthand];
        if (divName != null) {
          foundAny = true;
          if (divName === 'all') {
            this.expandAll();
          } else if (divName === 'none') {
            this.collapseAll();
          } else {
            this.toggle(divName);
          }
        }
      }
    });

    // Nothing in the URL; use browser-local storage.
    if (!foundAny) {
      this._restore();
    }

  }

  // Opening one closes others, unless expand-all.
  //
  // * If everything is expanded, selecting one means *keep* it expanded
  //   but collapse everything else.
  //
  // * If only one is expanded, then:
  //   o selecting that same one means collapse it;
  //   o selecting that another means collapse the old one and expand
  //     the new one.
  expandUniquely(divName) {
    const eleDiv = document.getElementById(divName);
    const button = document.getElementById(divName+'_button');
    let wasExpanded = false;
    if (eleDiv != null) {
      if (this._allExpanded) {
        this.collapseAll();
        if (button != null) {
          this._makeButtonSelected(button);
        }
        eleDiv.style.display = 'block';
        wasExpanded = true;
      } else {
        const state = eleDiv.style.display;
        this.collapseAll();
        if (state === 'block') {
          this._makeButtonDeselected(button);
          eleDiv.style.display = 'none';
          wasExpanded = false;
        } else {
          if (button != null) {
            this._makeButtonSelected(button);
          }
          eleDiv.style.display = 'block';
          wasExpanded = true;
        }
      }
    }
    this._allExpanded = false;

    if (wasExpanded) {
      this._saveOne(divName);
    } else {
      this._saveNone();
    }
  }

  expandAll() {
    for (let divName of this._allDivNames) {
      this._expand(divName);
    }
    this._allExpanded = true;
    this._saveAll();
  }

  collapseAll() {
    for (let divName of this._allDivNames) {
      this._collapse(divName);
    }
    this._allExpanded = false;
    this._saveNone();
  }

  toggle(divName) {
    const div = document.getElementById(divName);
    const button = document.getElementById(divName+'_button');
    if (div != null) {
      const state = div.style.display;
      if (state == 'block') {
        div.style.display = 'none';
        if (button != null) {
          this._makeButtonDeselected(button);
        }
        this._saveNone();
      } else {
        div.style.display = 'block';
        if (button != null) {
          this._makeButtonSelected(button);
        }
        this._saveOne(divName);
      }
    }
  }

  // ----------------------------------------------------------------
  // PRIVATE METHODS FOR TOGGLE FUNCTIONALITY

  _expand(divName) {
    const eleDiv = document.getElementById(divName);
    const button = document.getElementById(divName+'_button');
    if (eleDiv != null) {
      eleDiv.style.display = 'block';
    }
    if (button != null) {
      this._makeButtonSelected(button);
    }
  }

  _collapse(divName) {
    const eleDiv = document.getElementById(divName);
    const button = document.getElementById(divName+'_button');
    if (eleDiv != null) {
      eleDiv.style.display = 'none';
    }
    if (button != null) {
      this._makeButtonDeselected(button);
    }
  }

  _makeButtonSelected (button) {
    Object.keys(this._buttonSelectStyle).forEach(key => {
      button.style[key] = this._buttonSelectStyle[key];
    });
  }

  _makeButtonDeselected(button) {
    Object.keys(this._buttonDeselectStyle).forEach(key => {
      button.style[key] = this._buttonDeselectStyle[key];
    });
  }

  // ----------------------------------------------------------------
  // PRIVATE METHODS FOR MEMORY

  _restore () {
    if (localStorage != null) {
      const expanded = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (expanded != null) {
        if (expanded === ':all:') {
          this.expandAll();
        } else if (expanded === ':none:') {
          this.collapseAll();
        } else {
          this.expandUniquely(expanded);
        }
      }
    }
  }

  _saveOne(divName) {
    if (localStorage != null) {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, divName);
    }
  }

  _saveNone() {
    if (localStorage != null) {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, ':none:');
    }
  }

  _saveAll() {
    if (localStorage != null) {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, ':all:');
    }
  }
}

// module.exports = JKOToggler;
