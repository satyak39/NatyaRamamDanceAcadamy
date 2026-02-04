/* gallery-carousel.js
   Extracted lightbox + carousel behavior.
   - preserves existing poptrox overlay markup
   - adds visible prev/next arrow controls (SVG)
   - keyboard navigation (Esc, Left, Right)
   - circular navigation
*/
(function(){
    'use strict';

    function qs(sel, ctx){ return (ctx||document).querySelector(sel); }
    function qsa(sel, ctx){ return Array.prototype.slice.call((ctx||document).querySelectorAll(sel)); }

    function initLightbox(){
        var overlay = qs('.poptrox-overlay');
        var popup = overlay && qs('.poptrox-popup', overlay);
        var pic = popup && qs('.pic', popup);
        var caption = popup && qs('.caption', popup);
        var closer = popup && qs('.closer', popup);
        if(!overlay || !popup || !pic) return;

        function openOverlay(){ overlay.style.display = 'block'; popup.style.display = 'block'; if(closer) closer.style.display = 'block'; }
        function closeOverlay(){ overlay.style.display = 'none'; popup.style.display = 'none'; if(closer) closer.style.display = 'none'; if(pic){ pic.innerHTML = ''; pic.style.display = 'none'; } if(caption){ caption.style.display='none'; caption.innerHTML=''; } }

        // anchors inside gallery
        var anchors = qsa('#gallery a.js-lightbox');
        var currentIndex = -1;

        // Prevent duplicate navs if script run twice
        var existingPrev = popup.querySelector('.gc-nav.gc-prev');
        var existingNext = popup.querySelector('.gc-nav.gc-next');

        // create nav container elements if not present
        var navPrev = existingPrev || document.createElement('button');
        var navNext = existingNext || document.createElement('button');
        navPrev.className = 'gc-nav gc-prev';
        navNext.className = 'gc-nav gc-next';
        navPrev.setAttribute('aria-label','Previous image');
        navNext.setAttribute('aria-label','Next image');
        navPrev.type = navNext.type = 'button';
        // add simple visual SVG arrows inside
        var svgPrev = '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg>';
        var svgNext = '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"></path></svg>';
        navPrev.innerHTML = svgPrev;
        navNext.innerHTML = svgNext;

        // append if they were not present already
        if(!existingPrev) popup.appendChild(navPrev);
        if(!existingNext) popup.appendChild(navNext);

        function updateNavVisibility(){
            if(anchors.length <= 1){ navPrev.style.display = 'none'; navNext.style.display = 'none'; }
            else { navPrev.style.display = 'flex'; navNext.style.display = 'flex'; }
        }

        function renderItemAtIndex(i){
            if(anchors.length === 0) return;
            if(i < 0) i = (i % anchors.length + anchors.length) % anchors.length;
            if(i >= anchors.length) i = i % anchors.length;
            currentIndex = i;
            var a = anchors[i];
            var href = a.getAttribute('href') || a.href;
            if(!href) return;
            var type = a.getAttribute('data-type') || 'image';

            pic.innerHTML = '';

            if(type === 'image'){
                var img = document.createElement('img');
                img.src = href;
                img.alt = a.getAttribute('data-caption') || a.title || (a.querySelector('img') && a.querySelector('img').alt) || '';
                img.style.maxWidth = '92vw';
                img.style.maxHeight = '78vh';
                img.style.display = 'block';
                img.style.margin = '0 auto';
                img.style.objectFit = 'contain';
                pic.appendChild(img);
            } else {
                // basic iframe embed (YouTube friendly)
                var iframe = document.createElement('iframe');
                var src = href;
                if(/youtube\.com\/watch\?v=/.test(href)){
                    var id = href.split('v=')[1].split('&')[0];
                    src = 'https://www.youtube.com/embed/' + id + '?rel=0';
                } else if(/youtu\.be\//.test(href)){
                    var id = href.split('.be/')[1].split('?')[0];
                    src = 'https://www.youtube.com/embed/' + id + '?rel=0';
                }
                iframe.src = src;
                iframe.setAttribute('allow','accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
                iframe.setAttribute('allowfullscreen','');
                iframe.style.width = '100%';
                iframe.style.height = 'calc(80vh - 3.5rem)';
                iframe.style.border = '0';
                pic.appendChild(iframe);
            }

            pic.style.display = 'block';
            if(caption){ caption.style.display = 'block'; caption.innerHTML = a.getAttribute('data-caption') || a.title || ''; }
            openOverlay();
            updateNavVisibility();
        }

        // nav click handlers
        navPrev.addEventListener('click', function(e){ e.stopPropagation(); renderItemAtIndex(currentIndex - 1); });
        navNext.addEventListener('click', function(e){ e.stopPropagation(); renderItemAtIndex(currentIndex + 1); });

        // keyboard nav
        document.addEventListener('keydown', function(e){
            if(overlay.style.display !== 'block') return;
            if(e.key === 'Escape'){ closeOverlay(); return; }
            if(e.key === 'ArrowLeft'){ renderItemAtIndex(currentIndex - 1); }
            if(e.key === 'ArrowRight'){ renderItemAtIndex(currentIndex + 1); }
        });

        // anchor click wiring
        anchors.forEach(function(a, idx){
            a.addEventListener('click', function(e){
                e.preventDefault(); e.stopPropagation(); renderItemAtIndex(idx);
            });
        });

        // Close handlers (click outside popup)
        overlay.addEventListener('click', function(e){
            try { if (!popup.contains(e.target)) closeOverlay(); } catch(err) { if (e.target === overlay) closeOverlay(); }
        });
        closer && closer.addEventListener('click', function(e){ e.stopPropagation(); closeOverlay(); });

        // initial nav visibility
        updateNavVisibility();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initLightbox); else initLightbox();

})();
