let alertManager = new AlertManager('#global-overlay', '#alert-message');
let authorizationManager = new AuthorizationManager(alertManager, true);
let albums = new AlbumManager(alertManager, authorizationManager,"#artist-list", "#album-list", "#next-slice-container", "#ajax-loader");
let artists = new ArtistManager(alertManager, authorizationManager, '#artist-list', '#searchform', "#album-list");









