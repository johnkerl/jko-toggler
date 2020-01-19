// TO DO:
// * module.exports
// * document this class

'use strict';

class JKOToggler {
  LOCAL_STORAGE_KEY = document.URL + '-toggler-memory';

  // ----------------------------------------------------------------
  // PUBLIC METHODS

  constructor(toggleableDivPrefix, buttonSelectColor, buttonDeselectColor) {
    this._allDivNames = [];
    const divs = document.querySelectorAll('div');
    for (let div of divs) {
      const id = div.id;
      if (id.startsWith(toggleableDivPrefix)) {
        this._allDivNames.push(id);
      }
    }

    this._buttonSelectColor = buttonSelectColor;
    this._buttonDeselectColor = buttonDeselectColor;
    this._allExpanded = false;

    this._restore();
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
  expandUniquely = (divName) => {
    const eleDiv = document.getElementById(divName);
    const button = document.getElementById(divName+"_button")
    if (eleDiv != null) {
      if (this._allExpanded) {
        this.collapseAll();
        if (button != null) {
          this._makeButtonSelected(button);
        }
        eleDiv.style.display = "block";
      } else {
        const state = eleDiv.style.display;
        this.collapseAll();
        if (state === "block") {
          this._makeButtonDeselected(button);
          eleDiv.style.display = "none";
        } else {
          if (button != null) {
            this._makeButtonSelected(button);
          }
          eleDiv.style.display = "block";
        }
      }
    }
    this._allExpanded = false;

    this._saveOne(divName);
  };

  expandAll = () => {
    for (let divName of this._allDivNames) {
      this._expand(divName);
    }
    this._allExpanded = true;
    this._saveAll();
  };

  collapseAll = () => {
    for (let divName of this._allDivNames) {
      this._collapse(divName);
    }
    this._allExpanded = false;
    this._saveNone();
  }

  toggle = (divName) => {
    const div = document.getElementById(divName);
    const button = document.getElementById(divName+"_button")
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

  _expand = (divName) => {
    const eleDiv = document.getElementById(divName);
    const button = document.getElementById(divName+"_button")
    if (eleDiv != null) {
      eleDiv.style.display = "block";
    }
    if (button != null) {
      this._makeButtonSelected(button)
    }
  };

  _collapse = (divName) => {
    const eleDiv = document.getElementById(divName);
    const button = document.getElementById(divName+"_button")
    if (eleDiv != null) {
      eleDiv.style.display = "none";
    }
    if (button != null) {
      this._makeButtonDeselected(button)
    }
  };

  _makeButtonSelected = (button) => {
    button.style.borderColor = this._buttonSelectColor;
    button.style.borderWidth = 'thin';
    button.style.borderStyle = 'solid';
    button.style.borderRadius = '4px';
  };

  _makeButtonDeselected = (button) => {
    button.style.borderColor = this._buttonDeselectColor;
    button.style.borderWidth = 'none';
    button.style.borderStyle = 'none';
    button.style.borderRadius = '4px';
  };

  // ----------------------------------------------------------------
  // PRIVATE METHODS FOR MEMORY

  _restore = () => {
    if (localStorage != null) {
      const expanded = localStorage.getItem(this.LOCAL_STORAGE_KEY)
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
  };

  _saveOne = (divName) => {
    if (localStorage != null) {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, divName)
    }
  };

  _saveNone = () => {
    if (localStorage != null) {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, ':none:')
    }
  };

  _saveAll = () => {
    if (localStorage != null) {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, ':all:')
    }
  };

}

// module.exports = JKOToggler;