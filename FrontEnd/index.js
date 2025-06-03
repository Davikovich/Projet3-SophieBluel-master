// ======================
// Déclarations globales
// ======================
let works = [];             // Liste des projets
let categories = [];        // Liste des catégories
let imageInput;             // Input image
let validateBtn;            // Bouton valider
let addPhotoForm;           // Formulaire d'ajout
let imagePreview;           // Zone d'aperçu

// ======================
// Fonctions utilitaires
// ======================

// Appel API pour récupérer les projets
const getWorks = async () => {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    return await response.json();
  } catch (error) {
    console.error("Erreur lors du chargement des projets :", error);
    return [];
  }
};

// Appel API pour récupérer les catégories
const getCategories = async () => {
  try {
    const response = await fetch("http://localhost:5678/api/categories");
    return await response.json();
  } catch (error) {
    console.error("Erreur lors du chargement des catégories :", error);
    return [];
  }
};

// Injecte les projets dans la galerie principale
const insertWorksInTheDom = (worksToInsert = works) => {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";

  worksToInsert.forEach((work) => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const figcaption = document.createElement("figcaption");

    img.src = work.imageUrl;
    img.alt = work.title;
    figcaption.textContent = work.title;

    figure.appendChild(img);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
  });
};

// Crée les filtres dynamiques
const insertCategoriesInTheDom = () => {
  const filtersContainer = document.querySelector(".filters");
  filtersContainer.innerHTML = "";

  const setActiveButton = (button) => {
    document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
  };

  const allBtn = document.createElement("button");
  allBtn.textContent = "Tous";
  allBtn.classList.add("filter-btn");
  allBtn.addEventListener("click", () => {
    insertWorksInTheDom();
    setActiveButton(allBtn);
  });
  filtersContainer.appendChild(allBtn);

  categories.forEach((category) => {
    const btn = document.createElement("button");
    btn.textContent = category.name;
    btn.classList.add("filter-btn");
    btn.addEventListener("click", () => {
      const filtered = works.filter((w) => w.categoryId === category.id);
      insertWorksInTheDom(filtered);
      setActiveButton(btn);
    });
    filtersContainer.appendChild(btn);
  });

  setActiveButton(allBtn);
};

// Insère les catégories dans le <select> de la modale
const insertCategoriesInSelect = () => {
  const categorySelect = document.getElementById("category");
  categorySelect.innerHTML = '<option value="">--Choisir une catégorie--</option>';

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });
};

// Affiche les projets dans la modale d’administration
const insertWorksInModal = () => {
  const modalGallery = document.querySelector(".modal-gallery");
  modalGallery.innerHTML = "";
  const token = localStorage.getItem("token");

  works.forEach((work) => {
    const figure = document.createElement("figure");
    figure.dataset.id = work.id;

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = work.title;

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    deleteBtn.classList.add("delete-btn");

    deleteBtn.addEventListener("click", async () => {
      if (!confirm("Supprimer ce projet ?")) return;

      try {
        const response = await fetch(`http://localhost:5678/api/works/${work.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          figure.remove();
          works = works.filter((w) => w.id !== work.id);
          insertWorksInTheDom();
        }
      } catch (error) {
        console.error("Erreur suppression :", error);
      }
    });

    figure.appendChild(img);
    figure.appendChild(figcaption);
    figure.appendChild(deleteBtn);
    modalGallery.appendChild(figure);
  });
};

// Réinitialise la zone d’ajout d’image
const resetImagePreview = () => {
  imagePreview.textContent = "";

  const icon = document.createElement("i");
  icon.className = "fa-regular fa-image";

  const span = document.createElement("span");
  span.textContent = "+ Ajouter photo";

  const note = document.createElement("p");
  note.textContent = "jpg, png : 4mo max";

  const input = document.createElement("input");
  input.type = "file";
  input.name = "image";
  input.accept = ".jpg,.jpeg,.png";
  input.required = true;

  imagePreview.appendChild(icon);
  imagePreview.appendChild(span);
  imagePreview.appendChild(note);
  imagePreview.appendChild(input);

  imageInput = input;
  imageInput.addEventListener("change", () => {
    handleImagePreviewChange();
    updateValidateButtonState();
  });
};

// Affiche l’aperçu de l’image sélectionnée
const handleImagePreviewChange = () => {
  const file = imageInput.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      imagePreview.textContent = "";

      const img = document.createElement("img");
      img.src = e.target.result;
      img.style.maxHeight = "100%";
      img.style.objectFit = "contain";

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Supprimer";
      removeBtn.classList.add("btn-remove");

      removeBtn.addEventListener("click", () => {
        resetImagePreview();
        updateValidateButtonState();
      });

      imagePreview.appendChild(img);
      imagePreview.appendChild(removeBtn);
    };

    reader.readAsDataURL(file);
  }
};

// Active ou désactive le bouton "Valider"
const updateValidateButtonState = () => {
  const image = imageInput.files[0];
  const title = addPhotoForm.elements["title"].value.trim();
  const category = addPhotoForm.elements["category"].value;

  const isValid = image && title && category;

  validateBtn.disabled = !isValid;
  validateBtn.classList.toggle("valid", isValid);
};

// Gère les interactions de la modale
const setupModalNavigation = () => {
  const modal = document.getElementById("mediaModal");
  const modalOverlay = document.getElementById("modalOverlay");
  const modalClose = document.getElementById("modalClose");
  const openAddViewBtn = document.getElementById("openAddView");
  const openModalBtn = document.getElementById("openModal");

  const galleryView = document.getElementById("modalGalleryView");
  const addView = document.getElementById("modalAddView");

  if (openModalBtn) {
    openModalBtn.addEventListener("click", () => {
      modal.classList.remove("hidden");
      galleryView.classList.remove("hidden");
      addView.classList.add("hidden");
    });
  }

  modalOverlay.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  modalClose.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  if (openAddViewBtn) {
    openAddViewBtn.addEventListener("click", () => {
      galleryView.classList.add("hidden");
      addView.classList.remove("hidden");
      resetImagePreview();
    });
  }
};

// Configure le formulaire d’ajout de photo
const setupAddPhotoForm = () => {
  addPhotoForm = document.getElementById("addPhotoForm");
  imagePreview = document.getElementById("imagePreview");
  validateBtn = addPhotoForm.querySelector('button[type="submit"]');
  imageInput = addPhotoForm.querySelector('input[name="image"]');

  addPhotoForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const image = imageInput.files[0];
    const title = addPhotoForm.elements["title"].value.trim();
    const categoryId = parseInt(addPhotoForm.elements["category"].value);

    if (!image || !title || isNaN(categoryId)) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("title", title);
    formData.append("category", categoryId);

    try {
      const response = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Erreur API");

      alert("Projet ajouté !");
      addPhotoForm.reset();
      setupAddPhotoForm(); // Réinitialisation complète
      document.getElementById("mediaModal").classList.add("hidden");

      works = await getWorks();
      insertWorksInTheDom();
      insertWorksInModal();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'ajout du projet.");
    }
  });

  addPhotoForm.elements["title"].addEventListener("input", updateValidateButtonState);
  addPhotoForm.elements["category"].addEventListener("change", updateValidateButtonState);

  resetImagePreview();
};

// Affiche la bannière "mode édition" si utilisateur connecté
const setupAuthBanner = () => {
  const token = localStorage.getItem("token");
  const loginLink = document.querySelector('nav ul li a[href="login.html"]');

  if (token) {
    document.body.classList.add("connected");
    const banner = document.getElementById("edition-banner");
    if (banner) {
      banner.classList.remove("hidden");
      document.body.classList.add("has-banner");
    }

    if (loginLink) {
      loginLink.textContent = "logout";
      loginLink.href = "#";
      loginLink.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        window.location.reload();
      });
    }
  }
};

// =====================
// Initialisation globale
// =====================
const initApp = async () => {
  setupAuthBanner();
  setupModalNavigation();
  setupAddPhotoForm();

  works = await getWorks();
  categories = await getCategories();

  insertWorksInTheDom();
  insertCategoriesInTheDom();
  insertCategoriesInSelect();
  insertWorksInModal();
};

initApp();
