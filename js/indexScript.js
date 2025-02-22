document.getElementById('search-icon').addEventListener('click', async function () {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const searchResults = document.getElementById('searchResults');
    console.log("on load index");
    await search(searchInput,searchResults);
});

document.getElementById('indexPage').addEventListener('load', onloadIndex());
