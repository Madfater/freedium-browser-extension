@ECHO OFF

ECHO Creating directories...
if not exist "%CD%\temp\src" mkdir "%CD%\temp\src"
if not exist "%CD%\temp\icons" mkdir "%CD%\temp\icons"
if not exist "%CD%\chrome" mkdir "%CD%\chrome"

ECHO Cleaning directories...
DEL /q /s temp\*.* >nul 2>&1
DEL /q chrome\*.* >nul 2>&1

ECHO Copying files...
COPY /y manifest.json temp\
COPY /y src\*.js temp\src\
COPY /y src\*.css temp\src\
COPY /y src\*.html temp\src\
COPY /y icons\*.png temp\icons\

ECHO Creating freedium-browser-extension.zip...
cd temp
7z a -tzip ..\chrome\freedium-browser-extension.zip *
cd ..

ECHO Cleaning temp...
RMDIR /s /q temp

ECHO Done!
