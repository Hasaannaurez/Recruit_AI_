def extract_parameters(o_aspects):
    parameters = []
    
    # Extract parameters from the 'overall score' section if it exists
    if 'overall score' in o_aspects:
        for item in o_aspects['overall score']:
            if 'par' in item:
                parameters.append(item['par'])
    
    return parameters

def extract_u_parameters(o_aspects, g_aspects):
    unique_parameters = set()

    # Extract from o_aspects
    if 'overall score' in o_aspects.get('o_aspects', {}):
        for item in o_aspects['o_aspects']['overall score']:
            unique_parameters.add(item['par'])

    # Extract from g_aspects
    for category in g_aspects.get('g_aspects', {}):
        for item in g_aspects['g_aspects'][category]:
            unique_parameters.add(item['par'])

    return list(unique_parameters)