ARG VARIANT=16-bullseye
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:${VARIANT}

RUN \
  apt update -qq \
  && apt upgrade -yq \
  && apt install -yq ffmpeg
