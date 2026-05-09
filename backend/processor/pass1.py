import re
from .errors import MacroError

def run_pass1(source_code):
    lines = source_code.split('\n')
    mnt = []
    mdt = []
    ala_table = []
    intermediate_code = []
    
    in_macro = False
    macro_name = ""
    mdt_ptr = 1
    mnt_ptr = 1
    ala = {}
    
    for i, original_line in enumerate(lines):
        line = original_line.strip()
        if not line:
            # Keep empty lines in intermediate code if not in macro
            if not in_macro:
                intermediate_code.append(original_line)
            continue
            
        tokens = [t for t in re.split(r'[\s,]+', line) if t]
        if not tokens:
            continue
            
        if tokens[0] == 'MACRO':
            if in_macro:
                raise MacroError(f"Nested MACRO definitions are not supported.", i + 1)
            in_macro = True
            continue
            
        if in_macro:
            if not macro_name:
                # Prototype line
                macro_name = tokens[0]
                
                # Check for duplicate macro
                if any(entry['name'] == macro_name for entry in mnt):
                    raise MacroError(f"Duplicate macro definition: '{macro_name}'", i + 1)
                
                # Extract parameters
                params = tokens[1:]
                ala = {param: idx + 1 for idx, param in enumerate(params) if param.startswith('&')}
                
                for param, idx in ala.items():
                    ala_table.append({
                        'macro': macro_name,
                        'index': f"#{idx}",
                        'argument': param
                    })
                
                mnt.append({
                    'index': mnt_ptr,
                    'name': macro_name,
                    'pp': len(ala),
                    'mdtp': mdt_ptr
                })
                mnt_ptr += 1
                
                # Format prototype for MDT
                mdt.append({
                    'index': mdt_ptr,
                    'instruction': original_line.strip()
                })
                mdt_ptr += 1
            else:
                if tokens[0] == 'MEND':
                    mdt.append({
                        'index': mdt_ptr,
                        'instruction': 'MEND'
                    })
                    mdt_ptr += 1
                    in_macro = False
                    macro_name = ""
                    ala = {}
                else:
                    # Substitute parameters
                    instruction = original_line.strip()
                    # Sort by length to avoid partial replacements if names overlap
                    for param in sorted(ala.keys(), key=len, reverse=True):
                        # Simple replacement since parameters start with &
                        instruction = instruction.replace(param, f"#{ala[param]}")
                    
                    mdt.append({
                        'index': mdt_ptr,
                        'instruction': instruction
                    })
                    mdt_ptr += 1
        else:
            intermediate_code.append(original_line)
            
    if in_macro:
        raise MacroError("Missing MEND for macro definition.", len(lines))
        
    return {
        "mnt": mnt,
        "mdt": mdt,
        "ala": ala_table,
        "intermediate_code": "\n".join(intermediate_code)
    }
