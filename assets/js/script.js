const $pokedex = $('#pokedex');
const $loadMoreBtn = $('#loadMore'); // KEEP THIS ONE
const $searchInput = $('#search');   // KEEP THIS ONE
const $overlay = $('#pokemonOverlay');
const $closeOverlay = $('#closeOverlay');
const $overlayNameType = $('#overlayNameType');
const $overlayDetails = $('#overlayDetails');
const $showAttacksBtn = $('#showAttacks');

let offset = 0;
const limit = 100;
let selectedType = ''; // store selected type

async function getPokemon(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  return await res.json();
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function createTypeSpan(type) {
  return $('<span>')
    .addClass(`type-${type}`)
    .text(capitalize(type));
}

function createPokemonCard(pokemon) {
  const types = pokemon.types.map(t => t.type.name);
  const $card = $('<div>').addClass('pokemon-card');

  const img = pokemon.sprites.other['official-artwork'].front_default;

  $card.html(`
    <h2>${capitalize(pokemon.name)}</h2>
    <p>#${String(pokemon.id).padStart(3, '0')}</p>
    <img src="${img}" alt="${pokemon.name}">
  `);

  const $typeContainer = $('<div>').addClass('types');
  types.forEach(type => $typeContainer.append(createTypeSpan(type)));
  $card.append($typeContainer);

  $card.on('click', () => showOverlay(pokemon));
  return $card;
}

async function loadPokemons() {
  for (let i = offset + 1; i <= offset + limit; i++) {
    const pokemon = await getPokemon(i);
    const $card = createPokemonCard(pokemon);
    $pokedex.append($card);
  }
  offset += limit;
}

// Filter
function filterCards() {
  const searchTerm = $searchInput.val().toLowerCase();

  $('.pokemon-card').each(function () {
    const $card = $(this);
    const name = $card.find('h2').text().toLowerCase();
    const types = $card.find('.types span').map(function () {
      return $(this).text().toLowerCase();
    }).get();

    const matchesSearch = name.includes(searchTerm);
    const matchesType = !selectedType || types.includes(selectedType);

    $card.toggle(matchesSearch && matchesType);
  });
}

// Search and type filter
$searchInput.on('input', filterCards);
$('#typeButtons').on('click', '.type-button', function () {
  selectedType = $(this).data('type') || '';
  filterCards();

  $('.type-button').removeClass('active');
  $(this).addClass('active');
});

// Load more
$loadMoreBtn.on('click', loadPokemons);

// Overlay
function showOverlay(pokemon) {
  $('body').addClass('overlay-active');
  $overlay.css('display', 'flex');

  const imgHTML = `
    <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}" />
    <h2>${capitalize(pokemon.name)}</h2>
  `;
  $overlayNameType.html(imgHTML);

  const types = pokemon.types.map(t => capitalize(t.type.name)).join(', ');
  const abilities = pokemon.abilities.map(a => capitalize(a.ability.name)).join(', ');
  const height = pokemon.height / 10;
  const weight = pokemon.weight / 10;

  $overlayDetails.html(`
    <p><strong>Type:</strong> ${types}</p>
    <p><strong>Height:</strong> ${height} m</p>
    <p><strong>Weight:</strong> ${weight} kg</p>
    <p><strong>Abilities:</strong> ${abilities}</p>
    <div id="attackList" style="margin-top:1rem;"></div>
  `);

  $showAttacksBtn.off('click').on('click', () => {
    const moves = pokemon.moves.slice(0, 5).map(m => capitalize(m.move.name)).join(', ');
    $('#attackList').html(`<strong>Attacks:</strong> ${moves}`);
  });
}

$closeOverlay.on('click', () => {
  $('body').removeClass('overlay-active');
  $overlay.hide();
});

// Sound
const clickSound = document.getElementById('click-sound');
function playClickSound() {
  clickSound.currentTime = 0;
  clickSound.play();
}
document.querySelectorAll('button, #loadMore').forEach(btn => {
  btn.addEventListener('click', playClickSound);
});

// ✅ Initial load
loadPokemons();
