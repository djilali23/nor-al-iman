const CACHE_NAME = "nour-aliman-v1";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",

    "./icons/icon-192.png",
    "./icons/icon-512.png",

    "./audio/adhan-madina.mp3",
    "./audio/adhan-makkah.mp3",
    "./audio/adhan-egypt.mp3"
];


// عند تثبيت التطبيق
self.addEventListener("install", function(event) {

    event.waitUntil(

        caches.open(CACHE_NAME).then(function(cache) {

            return cache.addAll(FILES_TO_CACHE);

        })

    );

    self.skipWaiting();

});


// عند تشغيل النسخة الجديدة
self.addEventListener("activate", function(event) {

    event.waitUntil(

        caches.keys().then(function(keys) {

            return Promise.all(

                keys
                    .filter(function(key) {
                        return key !== CACHE_NAME;
                    })
                    .map(function(key) {
                        return caches.delete(key);
                    })

            );

        })

    );

    self.clients.claim();

});


// التعامل مع الملفات والصفحات
self.addEventListener("fetch", function(event) {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        caches.match(event.request).then(function(cachedResponse) {

            // إذا كان الملف محفوظًا في الهاتف/الحاسوب
            if (cachedResponse) {
                return cachedResponse;
            }

            // إذا لم يكن محفوظًا، تحميله من الإنترنت
            return fetch(event.request)

                .then(function(response) {

                    // التأكد من أن الاستجابة صحيحة
                    if (
                        !response ||
                        response.status !== 200 ||
                        response.type === "opaque"
                    ) {
                        return response;
                    }

                    // حفظ نسخة للاستخدام لاحقًا
                    const responseCopy = response.clone();

                    caches.open(CACHE_NAME).then(function(cache) {

                        cache.put(
                            event.request,
                            responseCopy
                        );

                    });

                    return response;

                })

                .catch(function() {

                    // إذا انقطع الإنترنت
                    return caches.match("./index.html");

                });

        })

    );

});