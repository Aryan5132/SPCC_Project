class MacroError(Exception):
    def __init__(self, message, line_num=None):
        self.message = message
        self.line_num = line_num
        super().__init__(self.message)

    def to_dict(self):
        return {
            "error": self.message,
            "line": self.line_num
        }
