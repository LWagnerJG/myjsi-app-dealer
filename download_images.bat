@echo off
cd /d "c:\Users\Luke Wagner\myjsi-app-dealer\myjsi-app-dealer\public\category-images\bench-images"

echo Downloading Finn...
curl.exe -s -L -A "Mozilla/5.0" -o "jsi_finn_comp_00001.jpg" "https://www.jsifurniture.com/media/catalog/product/j/s/jsi_finn_comp_00006.jpg"

echo Downloading Finn Nu...
curl.exe -s -L -A "Mozilla/5.0" -o "jsi_finnnu_comp_00001.jpg" "https://www.jsifurniture.com/media/catalog/product/j/s/jsi_finnnu_comp_00001.jpg"

echo Downloading Boston...
curl.exe -s -L -A "Mozilla/5.0" -o "jsi_boston_bench_00001.jpg" "https://www.jsifurniture.com/media/catalog/product/j/s/jsi_boston_comp_00007.jpg"

echo Downloading Connect...
curl.exe -s -L -A "Mozilla/5.0" -o "jsi_connect_comp_00001.jpg" "https://www.jsifurniture.com/media/catalog/product/j/s/jsi_connect_comp_00001.jpg"

echo Downloading Encore...
curl.exe -s -L -A "Mozilla/5.0" -o "jsi_encore_comp_00001.jpg" "https://www.jsifurniture.com/media/catalog/product/j/s/jsi_encore_comp_00001.jpg"

echo Done!
dir *.jpg
