FROM busybox

ARG TYPE="thing"
ARG NAME="random"
ARG KEY="default"

# Set environment variables based on build arguments
ENV ENV_TYPE $TYPE
ENV ENV_NAME $NAME
ENV ENV_KEY $KEY
ENV ENV_TEMPERATURE=20

CMD echo "TYPE=$ENV_TYPE" && \
    echo "NAME=$ENV_NAME" && \
    echo "KEY=$ENV_KEY" && \
    echo "TEMPERATURE=$ENV_TEMPERATURE"

