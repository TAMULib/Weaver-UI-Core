# Settings.
ARG USER_ID=3001
ARG USER_NAME=weaver
ARG SOURCE_DIR=/$USER_NAME/source

FROM node:18.12.0-slim as build
ARG USER_ID
ARG USER_NAME
ARG SOURCE_DIR

# Create the user and group (use a high ID to attempt to avoid conflicts).
RUN groupadd --non-unique -g $USER_ID $USER_NAME && \
    useradd --non-unique -d /$USER_NAME -m -u $USER_ID -g $USER_ID $USER_NAME

# Update the system and install dependencies (iproute2 is needed for "ip").
RUN apt-get update && \
    apt-get upgrade -y && \
    apt install iproute2 python build-essential -y

# Copy in files from outside of docker.
COPY . $SOURCE_DIR

# Ensure required file permissions.
RUN chown -R $USER_ID:$USER_ID $SOURCE_DIR

# Set deployment directory.
WORKDIR $SOURCE_DIR

# Login as user.
USER $USER_NAME

# Perform actions.
RUN npm install

ENV COMMAND 'start:registry'

CMD npm run $COMMAND
