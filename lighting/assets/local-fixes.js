(function () {
  document.documentElement.classList.add('static-capture');

  function redirectHashRoute() {
    var match = window.location.hash.match(/^#\/lighting\/([^/?#]+)\/?$/);
    if (!match) return false;

    var target = '/lighting/' + match[1] + '/';
    if (window.location.pathname !== target) {
      window.location.replace(target);
      return true;
    }
    return false;
  }

  if (redirectHashRoute()) return;

  function injectStyles() {
    if (document.getElementById('local-static-capture-styles')) return;

    var style = document.createElement('style');
    style.id = 'local-static-capture-styles';
    style.textContent = [
      '.static-capture .project-image .content-fill{display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important;background:#f3f3f3!important;}',
      '.static-capture .project-image img{position:static!important;display:block!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important;object-position:center!important;}',
      '.static-capture .sqs-gallery{display:block!important;position:relative!important;width:100%!important;height:auto!important;min-height:0!important;overflow:visible!important;}',
      '.static-capture .sqs-gallery .slide{position:relative!important;width:100%!important;height:auto!important;min-height:0!important;align-items:center!important;justify-content:center!important;overflow:visible!important;}',
      '.static-capture .sqs-gallery .slide img{position:static!important;display:block!important;width:auto!important;height:auto!important;max-width:100%!important;max-height:75vh!important;margin:0 auto!important;object-fit:contain!important;}',
      '.static-capture .sqs-gallery-thumbnails{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;gap:8px!important;overflow-x:auto!important;overflow-y:hidden!important;align-items:center!important;margin-top:14px!important;padding-bottom:8px!important;white-space:nowrap!important;}',
      '.static-capture .sqs-gallery-thumbnails img{position:static!important;display:block!important;flex:0 0 auto!important;width:auto!important;height:72px!important;max-width:none!important;object-fit:contain!important;object-position:center!important;cursor:pointer!important;opacity:.62!important;border:1px solid transparent!important;}',
      '.static-capture .sqs-gallery-thumbnails img.is-active{opacity:1!important;border-color:#999!important;}',
      '.static-capture .local-gallery{width:100%;margin:0 auto 18px;}',
      '.static-capture .local-gallery-main-wrap{display:flex;align-items:center;justify-content:center;background:#f3f3f3;min-height:240px;}',
      '.static-capture .local-gallery-main{display:block;max-width:100%;max-height:75vh;width:auto;height:auto;object-fit:contain;}',
      '.static-capture .local-gallery-thumbnails{display:flex;flex-direction:row;gap:8px;overflow-x:auto;overflow-y:hidden;margin-top:14px;padding-bottom:8px;}',
      '.static-capture .local-gallery-thumb{display:block;flex:0 0 auto;width:auto;height:72px;object-fit:contain;cursor:pointer;opacity:.62;border:1px solid transparent;}',
      '.static-capture .local-gallery-thumb.is-active{opacity:1;border-color:#999;}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function normalizeAssetUrl(value) {
    if (!value) return value;
    return value
      .replace(/\/lighting\/lighting\/assets\//g, '/lighting/assets/')
      .replace(/(\/lighting\/assets\/[^"'\s<>]+\.(?:jpe?g|JPG|png|gif|webp|svg))\/(?=($|[?#]))/g, '$1');
  }

  function fixLinks() {
    document.querySelectorAll('a[href^="/"]:not([href^="/lighting"])').forEach(function (link) {
      link.setAttribute('href', '/lighting' + link.getAttribute('href'));
    });
  }

  function fixImages() {
    document.querySelectorAll('img').forEach(function (image) {
      ['src', 'data-src', 'data-image', 'srcset', 'data-srcset'].forEach(function (name) {
        var value = image.getAttribute(name);
        if (value) image.setAttribute(name, normalizeAssetUrl(value));
      });

      var fallback = image.getAttribute('data-image') || image.getAttribute('data-src');
      fallback = normalizeAssetUrl(fallback);
      if (fallback && (!image.getAttribute('src') || image.getAttribute('src').indexOf('/lighting/lighting/assets/') !== -1)) {
        image.setAttribute('src', fallback);
      }
    });
  }

  function getImageUrl(image) {
    return normalizeAssetUrl(image && (image.getAttribute('data-image') || image.getAttribute('data-src') || image.getAttribute('src')));
  }

  function setImportantStyle(element, name, value) {
    element.style.setProperty(name, value, 'important');
  }

  function styleMainImage(image) {
    if (!image) return;
    setImportantStyle(image, 'position', 'static');
    setImportantStyle(image, 'display', 'block');
    setImportantStyle(image, 'width', 'auto');
    setImportantStyle(image, 'height', 'auto');
    setImportantStyle(image, 'max-width', '100%');
    setImportantStyle(image, 'max-height', '75vh');
    setImportantStyle(image, 'margin', '0 auto');
    setImportantStyle(image, 'object-fit', 'contain');
    setImportantStyle(image, 'opacity', '1');
    setImportantStyle(image, 'visibility', 'visible');
  }

  function styleThumbnailImage(image) {
    if (!image) return;
    setImportantStyle(image, 'position', 'static');
    setImportantStyle(image, 'display', 'block');
    setImportantStyle(image, 'width', 'auto');
    setImportantStyle(image, 'height', '72px');
    setImportantStyle(image, 'max-width', 'none');
    setImportantStyle(image, 'object-fit', 'contain');
    setImportantStyle(image, 'opacity', image.classList.contains('is-active') ? '1' : '.62');
    setImportantStyle(image, 'visibility', 'visible');
  }

  function setActiveSlide(gallery, thumbnails, index) {
    var slides = Array.prototype.slice.call(gallery.querySelectorAll('.slide'));
    slides.forEach(function (slide, slideIndex) {
      var active = slideIndex === index;
      slide.style.display = active ? 'flex' : 'none';
      slide.style.opacity = active ? '1' : '0';
      slide.style.visibility = active ? 'visible' : 'hidden';
      slide.style.pointerEvents = active ? 'auto' : 'none';
      slide.style.zIndex = active ? '1' : '0';
      styleMainImage(slide.querySelector('img'));
    });
    thumbnails.forEach(function (thumbnail, thumbnailIndex) {
      thumbnail.classList.toggle('is-active', thumbnailIndex === index);
      styleThumbnailImage(thumbnail);
    });
  }

  function fixGalleries() {
    document.querySelectorAll('.sqs-gallery').forEach(function (gallery) {
      var slides = Array.prototype.slice.call(gallery.querySelectorAll('.slide'));
      if (!slides.length || gallery.dataset.localGalleryReady === 'true') return;

      var thumbnailContainer = gallery.parentElement && gallery.parentElement.querySelector('.sqs-gallery-thumbnails');
      var thumbnails = thumbnailContainer ? Array.prototype.slice.call(thumbnailContainer.querySelectorAll('img')) : [];

      slides.forEach(function (slide) {
        var image = slide.querySelector('img');
        var url = getImageUrl(image);
        if (image && url) image.setAttribute('src', url);
        styleMainImage(image);
      });

      thumbnails.forEach(function (thumbnail, index) {
        var url = getImageUrl(thumbnail);
        if (url) thumbnail.setAttribute('src', url);
        styleThumbnailImage(thumbnail);
        thumbnail.addEventListener('click', function () {
          setActiveSlide(gallery, thumbnails, index);
        });
      });

      gallery.dataset.localGalleryReady = 'true';
      setActiveSlide(gallery, thumbnails, 0);
    });
  }

  function buildStaticGalleries() {
    document.querySelectorAll('.sqs-gallery').forEach(function (gallery) {
      var host = gallery.parentElement;
      if (!host || host.querySelector('.local-gallery')) return;

      var images = Array.prototype.slice.call(gallery.querySelectorAll('.slide img')).map(function (image) {
        return {
          src: getImageUrl(image),
          alt: image.getAttribute('alt') || ''
        };
      }).filter(function (image) {
        return !!image.src;
      });
      if (!images.length) return;

      var localGallery = document.createElement('div');
      localGallery.className = 'local-gallery';

      var mainWrap = document.createElement('div');
      mainWrap.className = 'local-gallery-main-wrap';
      var mainImage = document.createElement('img');
      mainImage.className = 'local-gallery-main';
      mainImage.src = images[0].src;
      mainImage.alt = images[0].alt;
      mainWrap.appendChild(mainImage);

      var thumbnailWrap = document.createElement('div');
      thumbnailWrap.className = 'local-gallery-thumbnails';

      images.forEach(function (image, index) {
        var thumbnail = document.createElement('img');
        thumbnail.className = 'local-gallery-thumb' + (index === 0 ? ' is-active' : '');
        thumbnail.src = image.src;
        thumbnail.alt = image.alt;
        thumbnail.addEventListener('click', function () {
          mainImage.src = image.src;
          mainImage.alt = image.alt;
          thumbnailWrap.querySelectorAll('.local-gallery-thumb').forEach(function (item) {
            item.classList.remove('is-active');
          });
          thumbnail.classList.add('is-active');
        });
        thumbnailWrap.appendChild(thumbnail);
      });

      localGallery.appendChild(mainWrap);
      localGallery.appendChild(thumbnailWrap);
      host.insertBefore(localGallery, gallery);

      gallery.style.setProperty('display', 'none', 'important');
      var meta = host.querySelector('.sqs-gallery-meta-container');
      var oldThumbnails = host.querySelector('.sqs-gallery-thumbnails');
      if (meta) meta.style.setProperty('display', 'none', 'important');
      if (oldThumbnails) oldThumbnails.style.setProperty('display', 'none', 'important');
    });
  }

  function run() {
    injectStyles();
    fixLinks();
    fixImages();
    fixGalleries();
    buildStaticGalleries();
  }

  run();
  document.addEventListener('DOMContentLoaded', run);
  window.addEventListener('load', run);
  window.setTimeout(run, 250);
  window.setTimeout(run, 1000);
  window.setTimeout(run, 2500);
  window.setTimeout(run, 5000);
})();
