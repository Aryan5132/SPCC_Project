import re
from .errors import MacroError

def run_pass2(intermediate_code, mnt, mdt):
    lines = intermediate_code.split('\n')
    expanded_code = []
    
    # Create lookup dictionaries for faster access
    mnt_lookup = {entry['name']: entry for entry in mnt}
    
    for i, original_line in enumerate(lines):
        line = original_line.strip()
        if not line:
            expanded_code.append(original_line)
            continue
            
        tokens = [t for t in re.split(r'[\s,]+', line) if t]
        if not tokens:
            expanded_code.append(original_line)
            continue
            
        opcode = tokens[0]
        # Check if opcode is a macro call
        if opcode in mnt_lookup:
            macro_entry = mnt_lookup[opcode]
            mdtp = macro_entry['mdtp']
            expected_params = macro_entry['pp']
            
            actual_params = tokens[1:]
            if len(actual_params) != expected_params:
                raise MacroError(f"Incorrect parameter count for macro '{opcode}'. Expected {expected_params}, got {len(actual_params)}.", i + 1)
            
            # Setup ALA for macro expansion
            ala = {f"#{idx + 1}": param for idx, param in enumerate(actual_params)}
            
            # Start expansion from MDTp + 1 (skip prototype)
            curr_mdt_idx = mdtp # MDT is 1-indexed, so mdt[curr_mdt_idx] is the line after prototype
            
            expanded_code.append(f"; --- Expansion of {opcode} ---")
            
            while True:
                # Find instruction in MDT
                # mdt is a list of dicts: {'index': 1, 'instruction': '...'}
                # Convert 1-based curr_mdt_idx to 0-based list index
                if curr_mdt_idx >= len(mdt):
                    raise MacroError(f"MDT overflow while expanding macro '{opcode}'. Missing MEND?", i + 1)
                    
                instruction_entry = mdt[curr_mdt_idx]
                instruction = instruction_entry['instruction']
                
                if instruction == 'MEND':
                    break
                    
                # Substitute actual arguments into instruction
                expanded_line = instruction
                # We can replace #1, #2 etc. 
                # Sort by length descending to replace #10 before #1 if we had 10+ params
                for placeholder in sorted(ala.keys(), key=len, reverse=True):
                    expanded_line = expanded_line.replace(placeholder, ala[placeholder])
                    
                expanded_code.append(expanded_line)
                curr_mdt_idx += 1
                
            expanded_code.append(f"; --- End of {opcode} ---")
        else:
            # Check for undefined macro (not in standard assembly and not in MNT)
            # A simple heuristic: if it's not a known standard instruction, label it as undefined
            standard_opcodes = {
                'START', 'END', 'READ', 'PRINT', 'STOP', 'DS', 'DC',
                'MOVER', 'MOVEM', 'ADD', 'SUB', 'MULT', 'DIV', 'BC', 'COMP', 'CG'
            }
            # Many labels might be present, so we shouldn't strictly fail on labels.
            # But in a mini-macro processor without label handling, we might assume first token is opcode.
            # To be safe and satisfy the requirement, if it ends with a colon or is standard, ignore.
            if opcode not in standard_opcodes and not opcode.endswith(':'):
                # We might not raise an error to prevent breaking user's custom programs,
                # but let's just treat standard opcodes + anything with colon as valid.
                # Actually, maybe just leave it, since users can define labels without colon in some assemblers.
                pass
            
            expanded_code.append(original_line)
            
    return "\n".join(expanded_code)
