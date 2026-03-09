#!/usr/bin/env python
import os
import sys
import pathlib

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))


def main() -> None:
  os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")
  try:
    from django.core.management import execute_from_command_line
  except ImportError as exc:
    raise ImportError(
      "Couldn't import Django. Are you sure it's installed and available on your PYTHONPATH environment variable?"
    ) from exc
  execute_from_command_line(sys.argv)


if __name__ == "__main__":
  main()
