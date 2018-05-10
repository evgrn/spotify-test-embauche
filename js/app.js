"use strict";
var alertManager = new AlertManager('#global-overlay', '#alert-message');
var authorizationManager = new AuthorizationManager(alertManager, true);
var albums = new AlbumManager(alertManager, authorizationManager, "#artist-list", "#album-list", "#next-slice-container", "#ajax-loader");
var artists = new ArtistManager(alertManager, authorizationManager, '#artist-list', '#searchform', "#album-list");
