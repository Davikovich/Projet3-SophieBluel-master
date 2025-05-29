// ======================
// Déclarations globales
// ======================
let works = [];
let categories = [];

// ==============================
// Fonctions d'appel à l'API
// ==============================

/** Récupère les projets depuis l'API */
const getWorks = async () => {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    return await response.json();
  } catch (error) {
    console.error("Erreur lors du chargement des projets :", error);
    return [];
  }
};

/** Récupère les catégories depuis l'API */
const getCategories = async () => {
  try {
    const response = await fetch("http://localhost:5678/api/categories");
    return await response.json();
  } catch (error) {
    console.error("Erreur lors du chargement des catégories :", error);
    return [];
  }
};

// ==================================
// Insertion des données dans le DOM
// ==================================

/** Affiche les projets dans la galerie principale */
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

/** Affiche les filtres par catégorie */
const insertCategoriesInTheDom = () => {
  const filtersContainer = document.querySelector(".filters");
  filtersContainer.innerHTML = "";

  const setActiveButton = (button) => {
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
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

/** Ajoute les catégories dans le <select> de la modale */
const insertCategoriesInSelect = () => {
  const categorySelect = document.getElementById("category");
  categorySelect.innerHTML =
    '<option value="">--Choisir une catégorie--</option>';

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });
};

// ===============================
// Authentification / Mode Admin
// ===============================
document.addEventListener("DOMContentLoaded", () => {
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
});

// ===========================================
// Modale : affichage, navigation, fermeture
// ===========================================
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
  });
}

// ========================================
// Affiche les projets dans la modale
// ========================================
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
      if (!confirm("Souhaitez-vous supprimer ce projet ?")) return;

      try {
        const response = await fetch(
          `http://localhost:5678/api/works/${work.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          figure.remove();
          works = works.filter((w) => w.id !== work.id);
          insertWorksInTheDom();
        } else {
          console.error("Erreur lors de la suppression du projet");
        }
      } catch (error) {
        console.error("Erreur API :", error);
      }
    });

    figure.appendChild(img);
    figure.appendChild(figcaption);
    figure.appendChild(deleteBtn);
    modalGallery.appendChild(figure);
  });
};

// ===========================================
// Ajout d'un projet depuis la modale
// ===========================================
const addPhotoForm = document.getElementById("addPhotoForm");
const imageInput = addPhotoForm.querySelector('input[name="image"]');
const imagePreview = document.getElementById("imagePreview");

addPhotoForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  const image = imageInput.files[0];
  const title = addPhotoForm.elements["title"].value.trim();
  const categoryId = parseInt(addPhotoForm.elements["category"].value);

  // Vérification des champs
  if (!image || !title || isNaN(categoryId)) {
    alert("Tous les champs doivent être remplis.");
    return;
  }

  // Vérifie le type de fichier
  const allowedTypes = ["image/jpeg", "image/png"];
  if (!allowedTypes.includes(image.type)) {
    alert("Seuls les fichiers JPG et PNG sont autorisés.");
    return;
  }

  // Vérifie la taille de l'image (4 Mo max)
  if (image.size > 4 * 1024 * 1024) {
    alert("L'image ne doit pas dépasser 4 Mo.");
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

    if (!response.ok) {
      throw new Error("Erreur lors de l'envoi à l'API");
    } else {
      const validateBtn = addPhotoForm.querySelector('button[type="submit"]');
      validateBtn.disabled = true;
      validateBtn.classList.remove("valid");
    }

    alert("Projet ajouté avec succès !");
    addPhotoForm.reset();
    imagePreview.innerHTML = `
      <i class="fa-regular fa-image"></i>
      <span>+ Ajouter photo</span>
      <p>jpg, png : 4mo max</p>
    `;

    works = await getWorks();
    insertWorksInTheDom();
    insertWorksInModal();

    modal.classList.add("hidden");
    galleryView.classList.remove("hidden");
    addView.classList.add("hidden");
  } catch (err) {
    console.error(err);
    alert("Erreur lors de l'ajout du projet.");
  }
});

// ============================================
// Prévisualisation de l'image avant envoi
// ============================================
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      imagePreview.innerHTML = "";

      const img = document.createElement("img");
      img.src = e.target.result;
      img.style.maxHeight = "100%";
      img.style.objectFit = "contain";

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Supprimer";
      removeBtn.classList.add("btn-remove");

      removeBtn.addEventListener("click", () => {
        imagePreview.innerHTML = `
          <i class="fa-regular fa-image"></i>
          <span>+ Ajouter photo</span>
          <p>jpg, png : 4mo max</p>
        `;
        imageInput.value = "";
      });

      imagePreview.appendChild(img);
      imagePreview.appendChild(removeBtn);
    };

    reader.readAsDataURL(file);
  }
});

const validateBtn = addPhotoForm.querySelector('button[type="submit"]');

// Fonction pour activer le bouton si tout est valide
const updateValidateButtonState = () => {
  const image = imageInput.files[0];
  const title = addPhotoForm.elements["title"].value.trim();
  const category = addPhotoForm.elements["category"].value;

  const isValid = image && title !== "" && category !== "";

  if (isValid) {
    validateBtn.disabled = false;
    validateBtn.classList.add("valid");
  } else {
    validateBtn.disabled = true;
    validateBtn.classList.remove("valid");
  }
};

// Surveille tous les champs
addPhotoForm.elements["image"].addEventListener(
  "change",
  updateValidateButtonState
);
addPhotoForm.elements["title"].addEventListener(
  "input",
  updateValidateButtonState
);
addPhotoForm.elements["category"].addEventListener(
  "change",
  updateValidateButtonState
);

// Initialisation au chargement (au cas où le champ image est pré-rempli)
updateValidateButtonState();

// =====================
// Lancement du script
// =====================
(async () => {
  works = await getWorks();
  categories = await getCategories();
  insertWorksInTheDom();
  insertCategoriesInTheDom();
  insertCategoriesInSelect();
  insertWorksInModal();
})();
