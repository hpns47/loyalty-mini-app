FROM postgres:17-alpine

COPY backup.sh /backup.sh
RUN chmod +x /backup.sh

ENTRYPOINT ["/bin/sh","-c","while true; do /backup.sh; sleep 86400; done"]
