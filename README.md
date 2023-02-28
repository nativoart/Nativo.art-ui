# Nativo NFT - User interface

![Logo](https://develop.testnet.nativonft.app/static/media/LogoBlanco.30fcfa22.png)

Nativo NFT is a marketplace builded over NEAR Protocol. It is building the next generation of NFT-DeFi mechanism for NFT ecosystem.

## Nativo NFT UI features
1. View of collections [x]
2. View of NFT Market [x]
3. View profile [x]
4. View my NFTs [x]
5. View my creations [x]
6. View my auctiones []
7. View notification []
8. View wallet sellector []
9. View loans []
10. View NFT Staking []


## 💻 Tecnologias usadas

Esta es la parte del proyecto enfacada en la UI/UX para esto se necesitaron las siguientes tecnologias:

1. Node.js >= 12 
2. React 
3. Pinata (IPFS gateway)
4. Tailwind
5. Wallet selector (NEAR Protocol)

## 👨🏻‍💻 Instalación local del proyecto

Para correr este proyecto de forma local se necesitan los siguientes requerimientos:

1. Tener instalado [Node.js] en su versión 12 o superior (recomendamos utilizar la herramienta de [nvm])
2. Instalar el manejador de paquetes de yarn `npm install -g yarn`
3. Instalar las dependencias del proyecto `npm install` o `yarn install` dentro del directorio que contiene el archivo `package.json`
4. Instalar de forma global el framework de Truffle `npm install -g truffle`
5. Compilar tailwind de manera local `npm run build-dev-tailwind`

## 📚 Arbol de archivos
```bash

```
 
[Node.js]: https://nodejs.org/en/download/package-manager/
[nvm]: https://github.com/nvm-sh/nvm


## Instrucciones para poder crear un drop
- Para poder crear un drop dentro de keypom en necesario ir al archivo hero.component.js

- En la linea de codigo #27 podras encontrar la funcion simpleDropNear, esta funcion es para poder crear un drop de NEAR.

- Debes de cambiar la cuenta y las llaves por las de la wallet que va a ejecutar las transacciones para poder crear un drop.

- Asegurate de ejecutar el proyecto con las variables de entorno de mainnet si no la ejecucion de las transacciones fallara

- Para poder crear un drop encontraras el boton en el landing

- deberas revisar los logs dentro de la consola del navegador para ver los enlaces de los drops generados

- NOTA: Por cada drop generado recarga la pagina para asegurarse que las transacciones se ejecuten generando link individuales