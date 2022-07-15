# Settings.
ARG USER_ID=3001
ARG USER_NAME=weaver
ARG HOME_DIR=/$USER_NAME
ARG SOURCE_DIR=$HOME_DIR/source

FROM node:lts-slim as build
ARG USER_ID
ARG USER_NAME
ARG HOME_DIR
ARG SOURCE_DIR

# Create the group (use a high ID to attempt to avoid conflits).
RUN groupadd -g $USER_ID $USER_NAME

# Create the user (use a high ID to attempt to avoid conflits).
RUN useradd -d $HOME_DIR -m -u $USER_ID -g $USER_ID $USER_NAME

# Update the system.
RUN apt-get update && apt-get upgrade -y

# Copy files over.
COPY . $SOURCE_DIR

# Assign file permissions.
RUN chown -R ${USER_ID}:${USER_ID} ${SOURCE_DIR}

# Set deployment directory.
WORKDIR $SOURCE_DIR

# Login as user.
USER $USER_NAME

# Perform actions.
RUN npm install

ENV COMMAND 'start:registry'

CMD npm run ${COMMAND}
