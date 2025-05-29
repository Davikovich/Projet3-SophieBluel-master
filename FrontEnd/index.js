/*
Faites l’appel à l’API avec fetch afin de récupérer dynamiquement les projets de l’architecte.
Utilisez JavaScript pour ajouter à la galerie les travaux de l’architecte que vous avez récupéré.
Supprimez du HTML les travaux qui étaient présents. Il ne doit vous rester que le contenu que vous avez ajouté dynamiquement grâce à JavaScript.
*/

let works = [];
let categories = [];

/** Récupération des projets via l'API */
const getWorks = async () => {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    return await response.json();
  } catch (error) {
    console.error("Erreur lors du chargement des projets :", error);
    return [];
  }
};

/** Récupération des catégories via l'API */
const getCategories = async () => {
  try {
    const response = await fetch("http://localhost:5678/api/categories");
    return await response.json();
  } catch (error) {
    console.error("Erreur lors du chargement des catégories :", error);
    return [];
  }
};

/** Insertion des projets dans la galerie principale */
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

/** Insertion des boutons de filtre */
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

// Initialisation des données
(async () => {
  works = await getWorks();
  categories = await getCategories();
  insertWorksInTheDom();
  insertCategoriesInTheDom();
  insertWorksInModal();
})();

// Authentification mode admin et récupération token

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

// Modale : gestion des vues
const modal = document.getElementById("mediaModal");
const modalOverlay = document.getElementById("modalOverlay");
const modalClose = document.getElementById("modalClose");
const openAddViewBtn = document.getElementById("openAddView");
const backToGalleryBtn = document.getElementById("backToGallery");

const galleryView = document.getElementById("modalGalleryView");
const addView = document.getElementById("modalAddView");
const openModalBtn = document.getElementById("openModal");

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

openAddViewBtn.addEventListener("click", () => {
  galleryView.classList.add("hidden");
  addView.classList.remove("hidden");
});

backToGalleryBtn.addEventListener("click", () => {
  addView.classList.add("hidden");
  galleryView.classList.remove("hidden");
});

// Insertion des projets dans la modale + suppression
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
        const response = await fetch(`http://localhost:5678/api/works/${work.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          figure.remove();
          works = works.filter(w => w.id !== work.id);
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




